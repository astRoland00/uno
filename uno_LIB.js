export class Player {
    constructor(name) {
        this.Cards=[]
        this.Name=name
    }
}
export class Card {
    constructor(color,value,display) {
        this.color = color
        this.value = value
        this.display = display
    }
}
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}