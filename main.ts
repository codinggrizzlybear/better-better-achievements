// @ts-nocheck
namespace SpriteKind {
    //% iskind
    export const Achievement = SpriteKind.create()
}

//% color="#e6ac00" icon="\uf091"
namespace achievements {
    const padding = 3

    export enum AchievementPosition {
        //% block="top left"
        TopLeft = 0,
        //% block="top right"
        TopRight = 1,
        //% block="bottom left"
        BottomLeft = 2,
        //% block="bottom right"
        BottomRight = 3
    }

    export enum AchievementAnimation {
        //% block="slide"
        Slide = 0,
        //% block="bounce"
        Bounce = 1,
        //% block="instant"
        Instant = 2
    }

    class QueueItem {
        title: string
        speed: number
        header: string
        icon: Image
        constructor(title: string, speed: number, header: string, icon: Image) {
            this.title = title
            this.speed = speed
            this.header = header
            this.icon = icon
        }
    }

    let notification: Sprite = null
    let titleColor: number = 15
    let headerColor: number = 13
    let bgColor: number = 1
    let notifPosition: AchievementPosition = AchievementPosition.TopLeft
    let notifAnimation: AchievementAnimation = AchievementAnimation.Slide
    let isPlaying: boolean = false
    let achievementQueue: QueueItem[] = []

    //% block="set achievement title color $color"
    //% color.shadow="colorindexpicker"
    export function setTitleColor(color: number): void {
        titleColor = color
    }
    //% block="set achievement header color $color"
    //% color.shadow="colorindexpicker"
    export function setHeaderColor(color: number): void {
        headerColor = color
    }
    //% block="set achievement background color $color"
    //% color.shadow="colorindexpicker"
    export function setBgColor(color: number): void {
        bgColor = color
    }
    //% block="set achievement position $pos"
    export function setNotifPosition(pos: AchievementPosition): void {
        notifPosition = pos
    }
    //% block="set achievement animation $anim"
    export function setAnimation(anim: AchievementAnimation): void {
        notifAnimation = anim
    }

    //% block="show achievement $title || speed $speed  header $header  icon $icon"
    //% icon.shadow="screen_image_picker" speed.defl=1
    //% expandableArgumentMode="enabeled"
    //% inlineInputMode="inline"
    export function create(title: string, speed?: number, header?: string, icon?: Image): void {
        if (isPlaying) {
            achievementQueue.push(new QueueItem(title, speed || 1, header, icon))
            return
        }
        isPlaying = true
        const achievement = new Achievement(title, header, icon)
        const img = achievement.getImage()
        const isBottom = notifPosition == AchievementPosition.BottomLeft || notifPosition == AchievementPosition.BottomRight
        const isRight = notifPosition == AchievementPosition.TopRight || notifPosition == AchievementPosition.BottomRight
        const x = isRight ? (160 - (img.width / 2) - 2) : ((img.width / 2) + 2)
        const startY = isBottom ? (120 + (img.height / 2)) : (0 - (img.height / 2))
        const enterY = isBottom ? (120 - (img.height / 2) - 2) : ((img.height / 2) + 2)
        const bounceY = isBottom ? enterY - 5 : enterY + 5
        notification = sprites.create(img, SpriteKind.Achievement)
        notification.setFlag(SpriteFlag.Ghost, true)
        notification.setFlag(SpriteFlag.RelativeToCamera, true)
        notification.z = (1 / 0)
        notification.setPosition(x, startY)
        control.runInParallel(function () {
            let velocity = speed || 1

            if (notifAnimation == AchievementAnimation.Instant) {
                notification.setPosition(x, enterY)
            } else {
                notification.vy = (isBottom ? -14 : 14) * velocity
                while (isBottom ? !(notification.y <= (notifAnimation == AchievementAnimation.Bounce ? bounceY : enterY)) : !(notification.y >= (notifAnimation == AchievementAnimation.Bounce ? bounceY : enterY))) {
                    pause(0)
                }
                if (notifAnimation == AchievementAnimation.Bounce) {
                    notification.vy = (isBottom ? 7 : -7) * velocity
                    while (isBottom ? !(notification.y >= enterY) : !(notification.y <= enterY)) {
                        pause(0)
                    }
                }
                notification.vy = 0
            }

            if (achievement.shouldScroll()) {
                pause(500)
                for (let scroll = 0; scroll < achievement.scrollLength() * (2 / velocity); scroll++) {
                    notification.setImage(achievement.scroll(achievement.getSplitImage()[0], achievement.getSplitImage()[1], scroll * (-0.5 * Math.abs(velocity))))
                    pause(0)
                }
                pause(1200 / velocity)
            } else {
                pause(1500 / (velocity / 2))
            }

            if (notifAnimation == AchievementAnimation.Instant) {
                notification.setPosition(x, startY)
            } else {
                notification.vy = (isBottom ? 14 : -14) * velocity
                while (isBottom ? !(notification.y >= startY) : !(notification.y <= startY)) {
                    pause(0)
                }
            }

            notification.destroy()
            notification = null
            isPlaying = false
            if (achievementQueue.length > 0) {
                const next = achievementQueue.shift()
                create(next.title, next.speed, next.header, next.icon)
            }
        })
    }
    //% block="cancel all achievement notifications"
    export function cancel() {
        achievementQueue = []
        isPlaying = false
        if (!isDestroyed(notification)) {
            notification.destroy()
        }
    }
    //% block="is achievement showing?"
    export function isShowing(): boolean {
        return isPlaying
    }
    //% block="achievements in queue"
    export function queueLength(): number {
        return achievementQueue.length
    }
    function isDestroyed(sprite: Sprite): boolean {
        return !sprite || !!(sprite.flags & sprites.Flag.Destroyed);
    }
    export class Achievement {
        // font5 - width: 6 | height: 5
        // font8 - width: 6 | height: 8
        public title: string;
        public header: string;
        public icon: Image;
        protected xOffset: number;
        constructor(title: string, header: string, icon: Image) {
            this.title = title
            this.header = header
            if (this.header == "") {
                this.header = null
            }
            this.icon = icon || image.create(0, 0)
        }
        protected draw() {
            let height = padding * 2
            this.xOffset = (this.icon.width == 0 ? 0 : 3) + this.icon.width
            let width = (padding * 2) + this.xOffset
            let textWidth = 0
            if (this.header) {
                height += Math.max(this.icon.height, 13)
                textWidth += Math.max(this.title.length, this.header.length) * 6
            } else {
                height += Math.max(this.icon.height, 8)
                textWidth += this.title.length * 6
            }

            width += textWidth
            const textImage = image.create(textWidth, height)

            const bubble = this.drawBubble(width, height, 156)

            bubble.drawTransparentImage(this.icon, padding, padding)
            if (this.header) {
                textImage.print(this.header, 0, padding, headerColor, image.font5)
                textImage.print(this.title, 0, 5 + padding, titleColor, image.font8)
            } else {
                textImage.print(this.title, 0, padding, titleColor, image.font8)

            }
            return [bubble, textImage]
        }
        public scroll(base: Image, layer: Image, scroll: number) {
            const bg = base
            const overlay = layer
            overlay.scroll(scroll, 0)
            bg.drawTransparentImage(overlay, this.xOffset + padding, 0)
            return bg
        }
        protected drawBubble(width: number, height: number, max?: number) {
            let realWidth = width
            if (width > max && max) {
                realWidth = max
            }
            const bubble = image.create(realWidth, height)
            bubble.fillRect(1, 0, realWidth - 2, height, bgColor)
            bubble.fillRect(0, 1, realWidth, height - 2, bgColor)
            return bubble
        }
        public getImage() {
            const bubble = this.draw()[0]
            bubble.drawTransparentImage(this.draw()[1], this.xOffset + padding, 0)
            return bubble
        }
        public getSplitImage() {
            return this.draw()
        }
        public shouldScroll(): boolean {
            return (this.xOffset + (padding * 2) + this.draw()[1].width) >= 156
        }
        public scrollLength(): number {
            return Math.max(0, this.xOffset + (padding * 2) + this.draw()[1].width) - 156
        }
    }
}