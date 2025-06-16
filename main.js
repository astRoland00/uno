import { Player } from './uno_LIB.js'
import { Card } from './uno_LIB.js'    
import { getRandomInt } from './uno_LIB.js';
let name
let all_cards = [];
let card_color = ["Blue","Green","Red","Yellow"]
const shuffleArray = (array) => array.sort(() => Math.random() - 0.5)
let player = new Player("játékos")
let players = [player, new Player("bot1"),new Player("bot2")]
let turn = 0
let turner = 1
let lastCard = null
let canplace = true
let plusmultiplier
let plusactive = false
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
    h2.textContent = `${players[turn].Name} következik...`
    if (players[turn] == player) {
        canplace = true
    }else{
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
        c.onclick = (()=>{PlaceCard(card,c)})
        let angle
        if (player.Cards.length%2==0) {
            angle = (player.Cards.indexOf(card)-((player.Cards.length/2)-0.5))*10
            //c.style.marginTop = `${((player.Cards.length/2)-(player.Cards.indexOf(card)-(player.Cards.length/2)))*20}px`
        }else{
            angle = (player.Cards.indexOf(card)+1-((player.Cards.length/2)+0.5))*10
        }
        c.style.rotate = `${angle}deg`
        if (Math.abs(angle) > 20) { 
            c.style.marginTop = `${Math.abs(angle) * 2}px`
        } else {
            c.style.marginTop = `0px`
        }
        hand.appendChild(c)

    });
    players.filter(notPlayer).forEach(element => {
        let bot =  document.getElementById(element.Name)
        bot.replaceChildren()
        for (let i = 0; i < element.Cards.length; i++) {
            let kartya = document.createElement("img")
            kartya.src = "Cards/Extra/bg.png"
            kartya.style.left = `${i*0.5}vw`

            kartya.style.marginTop = "8vw"
            kartya.style.marginLeft = "2vw"
            bot.appendChild(kartya)
        }
        
    });

}
function notPlayer(item) {
    return item != player
}
async function PlaceCard(card,cardobj) {
    let rakas = document.getElementById("rakas")
    if (canplace&&player == players[turn] && (lastCard==null || card.color == lastCard.color || card.value == lastCard.value)) {


        let placed = document.createElement("img")
        lastCard = card
        placed.classList.add("kartya")
        placed.src = card.display
        placed.style.position = "absolute"
        placed.style.rotate = `${getRandomInt(-40,40)}deg`

        let cardRect = document.getElementById("kez").getBoundingClientRect();
        let rakasRect = rakas.getBoundingClientRect();
        placed.style.left = `${cardRect.left}px`;
        placed.style.top = `${cardRect.top}px`;

        rakas.appendChild(placed);

        // Animáció végső pozíciója (a kártya a dobópakli közepére csúszik)
        setTimeout(() => {
            placed.classList.add("kartya-move");
            placed.style.left = `${rakasRect.width / 2}px`;
            placed.style.top = `${rakasRect.height / 2}px`;
            placed.style.transform = "translate(-50%, -50%)";
        }, 50);

        // Kártya eltávolítása a játékos kezéből
        for (let g = 0; g < player.Cards.length; g++) {
            if (player.Cards[g] == card) {
                player.Cards.splice(g, 1);
            }
        }

        console.log(card);
        UpdateHand();
        canplace = false;

        // Várakozás az animáció befejezésére, majd a kör kezelése
        setTimeout(() => {
            HandleTurn();
        }, 500);
    }
}
async function BotTurn(bot) {
    let rakas = document.getElementById("rakas")
    let bot_div = document.getElementById(bot.Name)
    bot_div.style.boxShadow = "0 0 3vw 0.5vw green"
    bot_div.style.transform = "scale(1.2)"
    await wait(2000)
    let validCards = bot.Cards.filter(ValidCard)
    if (validCards.length > 0) {
        let cardToPlace = validCards[0]
        let placed = document.createElement("img")
        placed.classList.add("kartya")
        placed.src = cardToPlace.display
        placed.style.position = "absolute"
        placed.style.rotate = `${getRandomInt(-40,40)}deg`
        
        let cardRect = document.getElementById(bot.Name).getBoundingClientRect();
        let rakasRect = rakas.getBoundingClientRect();
        placed.style.left = `${cardRect.left - rakasRect.left}px`;
        placed.style.top = `${cardRect.top - rakasRect.top}px`;

        rakas.appendChild(placed)

        setTimeout(() => {
            placed.classList.add("kartya-move");
            placed.style.left = `${rakasRect.width / 2}px`;
            placed.style.top = `${rakasRect.height / 2}px`;
            placed.style.transform = "translate(-50%, -50%)";
        }, 50);

        // Töröld a bot kezéből a lerakott lapot
        for (let g = 0; g < bot.Cards.length; g++) {
            if (bot.Cards[g] == cardToPlace) {
                bot.Cards.splice(g,1)
                break
            }
        }
        lastCard = cardToPlace
        console.log(cardToPlace)
        
        UpdateHand()


        setTimeout(() => {
            HandleTurn();
        }, 500);
    }else{
        let randomcard = getRandomInt(0,all_cards.length-1)
        bot.Cards.push(all_cards[randomcard])
        all_cards.splice(randomcard, 1)
        RefreshCards()
        HandleTurn()
        UpdateHand()
    }
    
    bot_div.style.boxShadow = "0 0 3vw 0.5vw whitesmoke"
    bot_div.style.transform = "scale(1)"
}
function ValidCard(card) {
    return lastCard==null || (card.color == lastCard.color || card.value == lastCard.value)
}

function PickUpCard() {
    if (canplace && player == players[turn]) {
        let randomcard = getRandomInt(0,all_cards.length-1)
        player.Cards.push(all_cards[randomcard])

        let card = document.createElement("img")
        card.classList.add("kartya")
        card.src = all_cards[randomcard].display
        card.style.position = "absolute"

        let cardRect = document.getElementById("kez").getBoundingClientRect();

        card.style.left = `55vw`;
        card.style.top = `16vw`;
        document.body.appendChild(card);
        setTimeout(() => {
            card.classList.add("kartya-move");
            card.style.left = `${cardRect.width/2}px`;
            card.style.top = `${cardRect.top+10}px`;
            card.style.transform = "translate(-50%, -50%)";
        }, 50);

        all_cards.splice(randomcard, 1)
        
        setTimeout(() => {
            
            RefreshCards()
            UpdateHand()
            canplace=false
            HandleTurn();
            card.remove();
        }, 500);
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
function ReadData(){
    console.log("kezdodik")
    name = document.querySelector("input").value;
    if (name.length > 0) {
        player.Name = name;
        document.querySelector(".bg").remove();
        Start()

    }else{
        alert("Adj meg egy nevet!")
    }
}


window.onload = function(){
    CardLoader(0) 
    console.log(all_cards)
    window.all_cards = shuffleArray(all_cards)
    window.players = players
    window.lastCard = lastCard
    document.querySelector(".bg>button").onclick = ReadData

}
