import "./sweeper.css"
import { Flag, Mood, MoodBad, GppBad } from "@mui/icons-material";
import { IconButton } from '@mui/material';
import { useEffect, useState } from "react";

const BOX_AMOUNT = 15;
const BOX_WIDTH = 20;
const DIFFICULTY = new Array(14).fill(0);
for (let i = 0; i < DIFFICULTY.length; i++) DIFFICULTY[i] = i * 15 + 10

// -1 is a BOMB
// 0 is UNCHECKED / COVERED UP
// 1,2,3... IS THE ACTUAL FIELD

function Sweeper() {
    const [gameOver, setGameOver] = useState(false);
    const [time, setTime] = useState(0);
    const [fieldSize, setFieldSize] = useState(BOX_AMOUNT);
    const [boxWidth, setBoxWidth] = useState(BOX_WIDTH);
    const [boxes, setBoxes] = useState<number[]>(new Array(BOX_AMOUNT * BOX_AMOUNT).fill(0));
    const [revealed, setRevealed] = useState(new Array(BOX_AMOUNT * BOX_AMOUNT).fill(false));
    const [flags, setFlags] = useState(new Array(BOX_AMOUNT * BOX_AMOUNT).fill(false));
    const [startingMines, setStartingMines] = useState(10);
    const [flagsPlaced, setFlagsPlaced] = useState(0);
    const [difficulty, setDifficulty] = useState(0);

    const handleReset = (bombs: number = -1) => {
        let tmpBoxes = new Array(BOX_AMOUNT * BOX_AMOUNT).fill(0);
        setBoxes(tmpBoxes);
        setRevealed(new Array(BOX_AMOUNT * BOX_AMOUNT).fill(false));
        setFlags(new Array(BOX_AMOUNT * BOX_AMOUNT).fill(false));
        setFlagsPlaced(0);
        if (bombs === -1) bombs = startingMines;
        generate(tmpBoxes, bombs);
        setGameOver(false);
    };
    useEffect(handleReset, []);  // run in the beginning to start the game

    const handleBoxClick = (n: number, rev: boolean[], first: boolean) => {
        if (gameOver) return;
        if (rev[n]) return;
        rev[n] = true;
        if (boxes[n] === -1) {
            setGameOver(true);
            return;
        };
        if (flags[n]) setFlagsPlaced(e => e - 1);
        flags[n] = false;
        if (boxes[n] === 0) {  // uncover all around
            let i = Math.floor(n / fieldSize);
            let j = n % fieldSize;
            for (let y = Math.max(i - 1, 0); y < Math.min(i + 2, fieldSize); y++) {
                for (let x = Math.max(j - 1, 0); x < Math.min(j + 2, fieldSize); x++) {
                    handleBoxClick(y * fieldSize + x, rev, false);
                }
            }
        }
        if (first) setRevealed([...rev]);
    };

    const handleBoxRightClick = (n: number) => {
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
                let gameWon = true;
                for (let i = 0; i < BOX_AMOUNT * BOX_AMOUNT; i++) {
                    if (flags[i] !== (boxes[i] === -1)) {
                        gameWon = false;
                        break;
                    }
                }
                if (gameWon) {
                    alert("Congrats! You won!");
                }
            }
        }
        setFlags([...flags]);
    };

    const handleDifficulty = (num: number) => {
        setStartingMines(DIFFICULTY[num]);
        handleReset(DIFFICULTY[num]);
        setDifficulty(num);
    };

    const generate = (tmpBoxes: number[], minesToPlace: number) => {
        let tmp = tmpBoxes.map(e => e);  // clone the array
        for (let i = 0; i < Math.min(minesToPlace, boxes.length); i++) {
            tmp[i] = -1;
        }
        tmp = shuffle(tmp);
        for (let i = 0; i < fieldSize; i++) {
            for (let j = 0; j < fieldSize; j++) {
                if (tmp[i * fieldSize + j] === -1) continue;  // ignore bombs
                let c = 0;
                for (let y = Math.max(i - 1, 0); y < Math.min(i + 2, fieldSize); y++) {
                    for (let x = Math.max(j - 1, 0); x < Math.min(j + 2, fieldSize); x++) {
                        if (tmp[y * fieldSize + x] === -1) c++;
                    }
                }
                tmp[i * fieldSize + j] = c;
            }
        }
        setBoxes(tmp);

    };

    useEffect(() => {
        if (gameOver) return;
        if (time === 999) return;
        setTimeout(() => setTime(p => p + 1), 1000);
    }, [time]);

    return (
        <>
            <div className="window" style={{ width: fieldSize * (boxWidth + 10) + 10 }}>
                <div className="topbar">
                    <h1 className="score mines">{pad(Math.max(0, startingMines - flagsPlaced), 3)}</h1>
                    <IconButton onClick={() => handleReset()}>
                        {!gameOver && <Mood sx={{ fontSize: 40 }} />}
                        {gameOver && <MoodBad sx={{ fontSize: 40 }} />}
                    </IconButton>
                    <h1 className="score timer">{pad(time, 3)}</h1>
                </div>

                <div className="game" style={{ gridTemplateColumns: `repeat(${fieldSize}, ${boxWidth + 10}px)`, gridTemplateRows: `repeat(${fieldSize}, ${boxWidth + 10}px)` }}>
                    {boxes.map((e, i) => {
                        let rev = revealed[i];
                        return (<div
                            className={`box box-${e} ${rev ? "box-rev" : ""} ${flags[i] ? "box-flag" : ""}`}
                            style={{ height: boxWidth, width: boxWidth }}
                            onClick={() => handleBoxClick(i, revealed, true)}
                            onContextMenu={() => handleBoxRightClick(i)}
                        >
                            {flags[i] && <Flag color="warning" sx={{ fontSize: 20 }} />}
                            {rev && e > 0 && e}
                            {rev && e === -1 && <GppBad sx={{ fontSize: 20 }} />}
                        </div>);
                    })}
                </div>
            </div>
            <div className="difficulty-buttons">
                {DIFFICULTY.map((e, i) => <div className={`difficulty-button beginner ${difficulty === i ? "active" : ""}`} onClick={() => handleDifficulty(i)}>{e} bombs</div>)}
            </div>
        </>
    );
}

// shuffles an array
function shuffle(array: number[]) {
    let counter = array.length;

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;

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
