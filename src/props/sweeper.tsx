import "./sweeper.css"
import { Flag, Mood, MoodBad, GppBad, ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import { useEffect, useState } from "react";

const BOX_VERT = 15;
const BOX_HORIZ = 15;
const BOX_WIDTH = 20;
const DIFFICULTY = new Array(14).fill(0);
for (let i = 0; i < DIFFICULTY.length; i++) DIFFICULTY[i] = i * 15 + 10;
let mouseDown = false;

// -1 is a BOMB
// 0 is UNCHECKED / COVERED UP
// 1,2,3... IS THE ACTUAL FIELD

function Sweeper() {
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [time, setTime] = useState(0);
    const [tick, setTick] = useState(0);  // this is simply used to make the timer work
    const [horizontal, setHorizontal] = useState(BOX_HORIZ);
    const [vertical, setVertical] = useState(BOX_VERT);
    const [boxWidth, setBoxWidth] = useState(BOX_WIDTH);
    const [boxes, setBoxes] = useState<number[]>(new Array(BOX_HORIZ * BOX_VERT).fill(0));
    const [revealed, setRevealed] = useState(new Array(BOX_HORIZ * BOX_VERT).fill(false));
    const [flags, setFlags] = useState(new Array(BOX_HORIZ * BOX_VERT).fill(false));
    const [startingMines, setStartingMines] = useState(10);
    const [flagsPlaced, setFlagsPlaced] = useState(0);

    const handleReset = (bombs: number = -1) => {
        console.log(horizontal, vertical);
        let tmpBoxes = new Array(horizontal * vertical).fill(0);
        setBoxes(tmpBoxes);
        setRevealed(new Array(horizontal * vertical).fill(false));
        setFlags(new Array(horizontal * vertical).fill(false));
        setFlagsPlaced(0);
        if (bombs === -1) bombs = startingMines;
        setGameOver(false);
        setGameWon(false);
        setGameStarted(false);
        setTime(0);
    };
    useEffect(handleReset, [horizontal, vertical]);  // run in the beginning to start the game

    const handleBoxClick = (n: number, rev: boolean[], first: boolean, gs: boolean, tmpBoxes = boxes) => {
        if (gameOver || gameWon) return;
        if (rev[n]) return;


        if (!gs) {  // makes sure the first click isn't a bomb
            tmpBoxes = generate(boxes, startingMines, n);
            setGameStarted(true);
        }

        rev[n] = true;
        if (tmpBoxes[n] === -1) {
            setGameOver(true);
            return;
        };
        if (flags[n]) setFlagsPlaced(e => e - 1);
        flags[n] = false;
        if (tmpBoxes[n] === 0) {  // uncover all around
            let i = Math.floor(n / horizontal);
            let j = n % horizontal;
            for (let y = Math.max(i - 1, 0); y < Math.min(i + 2, vertical); y++) {
                for (let x = Math.max(j - 1, 0); x < Math.min(j + 2, horizontal); x++) {
                    handleBoxClick(y * horizontal + x, rev, false, true, tmpBoxes);
                }
            }
        }
        if (first) {
            setRevealed([...rev]);
            // check if game is won
            let winCondition = true;
            for (let i = 0; i < vertical * horizontal; i++) {
                if (!rev[i] && tmpBoxes[i] >= 0) winCondition = false;
            }
            if (winCondition) {
                setGameWon(true);
                alert("Congrats! You won!");
            }
        }

    };

    // determines what happens if a box is right clicked
    const handleBoxRightClick = (n: number) => {
        if (gameOver || gameWon) return;
        if (revealed[n]) return;
        if (flags[n]) {
            flags[n] = false;
            setFlagsPlaced(e => e - 1);
        } else {
            flags[n] = true;
            let tmp = flagsPlaced + 1;
            setFlagsPlaced(tmp);

            // check if the game has been won
            if (tmp === startingMines) {
                let winCondition = true;
                for (let i = 0; i < horizontal * vertical; i++) {
                    if (flags[i] !== (boxes[i] === -1)) {
                        winCondition = false;
                        break;
                    }
                }
                if (winCondition) {
                    setGameWon(true);
                    alert("Congrats! You won!");
                }
            }
        }
        setFlags([...flags]);
    };

    const handleMouseDown = (func: CallableFunction, first = true) => {
        if (!mouseDown) return;
        func();
        if (gameStarted) handleReset();
        setTimeout(() => handleMouseDown(func, false), first ? 500 : 20);
    };

    const handleNegSizeChange = (dir: "v" | "h",) => {
        if (dir === "h") {
            let newVal = Math.max(9, horizontal - 1);
            setStartingMines(e => Math.min(newVal * vertical - 1, e));
            setHorizontal(newVal);
        } else {
            let newVal = Math.max(9, vertical - 1);
            setStartingMines(e => Math.min(newVal * horizontal - 1, e));
            setVertical(newVal);
        }
    }

    const generate = (tmpBoxes: number[], minesToPlace: number, clickNum: number) => {
        let tmp = tmpBoxes.map(e => e);  // clone the array
        let i = 0, c = 0;
        while (i < boxes.length && c < minesToPlace) {
            if (i === clickNum) i++;  // we simply skip the box we don't want to have a bomb
            tmp[i] = -1;
            c++;
            i++;
        }
        for (let i = 0; i < Math.min(minesToPlace, boxes.length); i++) {
        }
        tmp = shuffle(tmp, clickNum);
        for (let i = 0; i < vertical; i++) {
            for (let j = 0; j < horizontal; j++) {
                if (tmp[i * horizontal + j] === -1) continue;  // ignore bombs
                let c = 0;
                for (let y = Math.max(i - 1, 0); y < Math.min(i + 2, vertical); y++) {
                    for (let x = Math.max(j - 1, 0); x < Math.min(j + 2, horizontal); x++) {
                        if (tmp[y * horizontal + x] === -1) c++;
                    }
                }
                tmp[i * horizontal + j] = c;
            }
        }
        setBoxes(tmp);
        return tmp;

    };

    useEffect(() => {
        if (gameOver || !gameStarted || gameWon) return;
        if (time === 999) return;
        setTimeout(() => { setTime(p => p + 1); setTick(p => p + 1) }, 1000);
    }, [tick, gameOver, gameStarted, gameWon]);

    return (
        <>
            <div className="window" style={{ width: horizontal * (boxWidth + 10) + 10 }}>
                <div className="topbar">
                    <div className="score">
                        <h1>{pad(Math.max(0, startingMines - flagsPlaced), 3)}</h1>
                    </div>
                    <div className="smiley-button button" onClick={() => handleReset()}>
                        {!gameOver && <Mood sx={{ fontSize: 40, color: "yellow" }} />}
                        {gameOver && <MoodBad sx={{ fontSize: 40, color: "yellow" }} />}
                    </div>
                    <div className="score">
                        <h1>{pad(time, 3)}</h1>
                    </div>
                </div>

                <div className="game" style={{ gridTemplateColumns: `repeat(${horizontal}, ${boxWidth + 10}px)`, gridTemplateRows: `repeat(${vertical}, ${boxWidth + 10}px)` }}>
                    {boxes.map((e, i) => {
                        let rev = revealed[i];
                        let specClasses = rev ? `box-rev box-${e}` : "";
                        return (<div
                            className={`box ${specClasses} ${!rev && flags[i] ? "box-flag" : ""}`}
                            style={{ height: boxWidth, width: boxWidth }}
                            onClick={() => handleBoxClick(i, revealed, true, gameStarted)}
                            onContextMenu={() => handleBoxRightClick(i)}
                        >
                            {!rev && flags[i] && <Flag color="warning" sx={{ fontSize: 20 }} />}
                            {rev && e > 0 && e}
                            {rev && e === -1 && <GppBad sx={{ fontSize: 20 }} />}
                        </div>);
                    })}
                </div>
                <div className="difficulty">
                    <div className="menu">
                        <h1>bombs</h1>
                        <div style={{ display: "flex", flexDirection: "row", margin: 0 }}>
                            <div className="button" onMouseDown={() => { mouseDown = true; handleMouseDown(() => setStartingMines(e => Math.max(1, e - 1))); }} onMouseUp={() => { mouseDown = false; }}>
                                <ArrowBackIosNew />
                            </div>
                            <div className="button" onMouseDown={() => { mouseDown = true; handleMouseDown(() => setStartingMines(e => Math.min(horizontal * vertical - 1, e + 1))); }} onMouseUp={() => { mouseDown = false; }}>
                                <ArrowForwardIos />
                            </div>
                        </div>
                    </div>

                    <div className="menu">
                        <h1>x</h1>
                        <div style={{ display: "flex", flexDirection: "row", margin: 0 }}>
                            <div className="button" onClick={() => handleNegSizeChange("h")}>
                                <ArrowBackIosNew />
                            </div>
                            <div className="button" onClick={() => setHorizontal(e => e + 1)}>
                                <ArrowForwardIos />
                            </div>
                        </div>
                    </div>

                    <div className="menu">
                        <h1>y</h1>
                        <div style={{ display: "flex", flexDirection: "row", margin: 0 }}>
                            <div className="button" onClick={() => handleNegSizeChange("v")}>
                                <ArrowBackIosNew />
                            </div>
                            <div className="button" onClick={() => setVertical(e => e + 1)}>
                                <ArrowForwardIos />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// shuffles an array
function shuffle(array: number[], numToIgnore: number) {
    let counter = array.length;

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        if (index === numToIgnore || counter === numToIgnore) continue;  // to avoid clicking on a bomb first click

        // swap elements
        let tmp = array[counter];
        array[counter] = array[index];
        array[index] = tmp;
    }
    return array;
}

function pad(n: number, length: number) {
    return ("0".repeat(length) + n).slice(-length);
}

export default Sweeper;
