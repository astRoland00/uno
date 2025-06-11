import { Player } from './uno_LIB.js'
import { Card } from './uno_LIB.js'    
import { getRandomInt } from './uno_LIB.js';

let all_cards = [];
let card_color = ["Blue","Green","Red","Yellow"]
const shuffleArray = (array) => array.sort(() => Math.random() - 0.5)
let player = new Player("Jani")
let players = [player, new Player("bot1"),new Player("bot2")]
let turn = 0
let turner = 1
let lastCard = null
let canplace = true
function CardLoader(j) {
    for (let i = 0; i < 13; i++) {
        switch (i) {
            case 10:
                all_cards.push( new Card(card_color[j],"+2",`./Cards/${card_color[j]}/card${i}.png`))
                break;
            case 11:
                all_cards.push(new Card(card_color[j],"rotate",`./Cards/${card_color[j]}/card${i}.png`))
                break
            case 12:
                all_cards.push(new Card(card_color[j],"skip",`./Cards/${card_color[j]}/card${i}.png`))
                break
            default:
                all_cards.push(new Card(card_color[j],i,`./Cards/${card_color[j]}/card${i}.png`))
                break;
        }
        
    
    }
    console.log(all_cards)
    if (j+1<card_color.length) {
        CardLoader(j+1)
    }
    
}

function Start() {
    players.forEach(element => {
        for (let i = 0; i < 7; i++) {
            let randomcard = getRandomInt(0,all_cards.length-1)
            element.Cards.push(all_cards[randomcard])
            delete all_cards[randomcard]
            console.log(randomcard)
            RefreshCards()
        }
    });
    let dock = document.getElementById("pakli")
    dock.onclick = (()=>{PickUpCard()})
    UpdateHand()
    Game()
}
function RefreshCards() {
    let temp = []
    for (let j = 0; j < all_cards.length; j++) {
        if (all_cards[j]!=null) {
            temp.push(all_cards[j])
        }
    }
    all_cards=temp
}
function Game() {
    let h2 = document.querySelector("h2")
    if (players[turn] == player) {
        h2.textContent = `Te követketkezel...`
        canplace = true
    }else{
        h2.textContent = `${players[turn].Name} következik...`
        BotTurn(players[turn])

        
    }
}
function UpdateHand() {
    let hand = document.getElementById("kez")
    hand.replaceChildren()
    player.Cards.forEach(card => {
        let c = document.createElement("button")
        c.classList.add("kartya","kartyakez")
        c.style.backgroundImage=`url(${card.display})`
        c.onclick = (()=>{PlaceCard(card)})
        hand.appendChild(c)

    });

}
function PlaceCard(card) {
    let rakas = document.getElementById("rakas")
    if (canplace&&player == players[turn] && (lastCard==null || card.color == lastCard.color || card.value == lastCard.value)) {
        
        let placed = document.createElement("img")
        lastCard = card
        placed.classList.add("kartya")
        placed.src = card.display
        placed.style.position = "absolute"
        placed.style.rotate = `${getRandomInt(-30,30)}deg`
        for (let g = 0; g < player.Cards.length; g++) {
            if (player.Cards[g] == card) {
                player.Cards.splice(g,1)
            }
        }
        console.log(card)
        rakas.appendChild(placed)
        UpdateHand()
        canplace=false
        HandleTurn()
    }
}
async function BotTurn(bot) {
    let rakas = document.getElementById("rakas")
    let bot_div = document.getElementById(bot.Name)
    bot_div.style.border = "10px solid green"
    bot_div.style.transform = "scale(1.2)"
    await wait(2000)
    let validCards = bot.Cards.filter(ValidCard)
    if (validCards.length > 0) {
        let cardToPlace = validCards[0]
        let placed = document.createElement("img")
        placed.classList.add("kartya")
        placed.src = cardToPlace.display
        placed.style.position = "absolute"
        placed.style.rotate = `${getRandomInt(-30,30)}deg`
        // Töröld a bot kezéből a lerakott lapot
        for (let g = 0; g < bot.Cards.length; g++) {
            if (bot.Cards[g] == cardToPlace) {
                bot.Cards.splice(g,1)
                break
            }
        }
        lastCard = cardToPlace
        console.log(cardToPlace)
        rakas.appendChild(placed)
        HandleTurn()
    }else{
        let randomcard = getRandomInt(0,all_cards.length-1)
        bot.Cards.push(all_cards[randomcard])
        all_cards.splice(randomcard, 1)
        RefreshCards()
        HandleTurn()
    }
    
    bot_div.style.border = "none"
    bot_div.style.transform = "scale(1)"
}
function ValidCard(card) {
    return lastCard==null || (card.color == lastCard.color || card.value == lastCard.value)
}

function PickUpCard() {
    if (canplace && player == players[turn]) {
        let randomcard = getRandomInt(0,all_cards.length-1)
        player.Cards.push(all_cards[randomcard])
        all_cards.splice(randomcard, 1)
        RefreshCards()
        UpdateHand()
        canplace=false
        HandleTurn()
    }
}
function HandleTurn() {
    if (lastCard.value=="rotate") {
        turner=-turner
    }else if(lastCard.value=="skip"){
        turn+=1
    }
    if (turner == 1) {
        if (turn+1 < players.length) {
            turn++
        }else{
            turn = 0
        }
    }else{
        if (turn-1 >= 0) {
            turn--
        }else{
            turn = players.length-1
        }
    }
    Game()
}
function wait(num) {
  return new Promise(resolve => setTimeout(resolve, num));
}
window.onload = function(){
    CardLoader(0) 
    console.log(all_cards)
    window.all_cards = shuffleArray(all_cards)
    window.players = players
    window.lastCard = lastCard
    Start()
}
