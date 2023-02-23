import React, { useState, useEffect } from "react";
import "./TowerOfHanoi.css";
import music1 from"./music/music1.mp3";
import music2 from "./music/music2.mp3";
const musicList = [
  {
    name: "Song 1",
    file: music1,
  },
  {
    name: "Song 2",
    file: music2,
  },
];
function Tower(props) {
  const { disks, onDragStart, onDrop } = props;
  return (
    <div
      className="tower"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="sahig"></div>
      {disks
        .slice()
        .sort((a, b) => a - b)
        .map((size) => (
          <Disk key={size} size={size} onDragStart={onDragStart} />
        ))}
    </div>
  );
}
function Disk(props) {
  const { size, onDragStart } = props;
  const colors = [
    "#FF6633",
    "#FFB399",
    "#FF33FF",
    "#FFFF99",
    "#00B3E6",
    "#E6B333",
    "#3366E6",
    "#999966",
    "#99FF99",
    "#B34D4D",
  ];
  const color = colors[size - 1];

  const diskStyle = {
    backgroundColor: color,
    width: `${50 + (size - 1) * 15}px`,
    height: "20px",
  };

  return (
    <div
      className="disk"
      style={diskStyle}
      draggable
      onDragStart={(e) => onDragStart(e, size)}
    >
      <span>{size}</span>
    </div>
  );
}

function TowerOfHanoi() {
  const [numDisks, setNumDisks] = useState(3);
  const [currentSong, setCurrentSong] = useState(musicList[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(new Audio(currentSong.file));

  function handlePlayPause() {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleSongSelect(e) {
    const selectedSongName = e.target.value;
    const selectedSong = musicList.find((song) => song.name === selectedSongName);
    setCurrentSong(selectedSong);
    audioRef.current.pause();
    audioRef.current = new Audio(selectedSong.file);
    setIsPlaying(false);
  }
  const [towers, setTowers] = useState({
    A: [3, 2, 1],
    B: [],
    C: [],
  });
  const [draggedDisk, setDraggedDisk] = useState(null);
  const [numMoves, setNumMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [time, setTime] = useState(0); // new state variable for timer
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setTime((time) => time + 1);
    }, 1000);
    setIntervalId(id);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (gameWon) {
      clearInterval(intervalId);
    }
  }, [gameWon, intervalId]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };
  function handleDragStart(e, size) {
    const sourceTower = Object.entries(towers).find(([_, disks]) =>
      disks.includes(size)
    )[0];
    const smallestDisk = Math.min(...towers[sourceTower]);
    if (size === smallestDisk) {
      setDraggedDisk(size);
    }
  }

  function handleDrop(e, tower) {
    e.preventDefault();
    if (draggedDisk === null) {
      return;
    }
    const sourceTower = Object.entries(towers).find(([_, disks]) =>
      disks.includes(draggedDisk)
    )[0];
    if (
      tower !== sourceTower &&
      (towers[tower][0] === undefined || towers[tower][0] > draggedDisk)
    ) {
      const newTowers = {
        ...towers,
        [sourceTower]: towers[sourceTower].filter(
          (disk) => disk !== draggedDisk
        ),
        [tower]: [draggedDisk, ...towers[tower]],
      };
      setTowers(newTowers);
      setNumMoves(numMoves + 1);
      checkGameWon(newTowers);
    }
    setDraggedDisk(null);
  }
  function handleNumDisksChange(e) {
    const numDisks = parseInt(e.target.value);
    const disks = Array.from({ length: numDisks }, (_, i) => i + 1).reverse();
    setNumDisks(numDisks);
    setTowers({ A: disks, B: [], C: [] });
    setNumMoves(0);
    setGameWon(false);
  }
  function checkGameWon(towers) {
    if (towers.C.length === numDisks) {
      setGameWon(true);
    }
  }
  function moveTower(numDisks, start, end, other) {
    if (numDisks === 1) {
      moveDisk(towers[start][towers[start].length - 1], start, end);
    } else {
      moveTower(numDisks - 1, start, other, end);
      moveDisk(towers[start][towers[start].length - 1], start, end);
      moveTower(numDisks - 1, other, end, start);
    }
  }

  function moveDisk(disk, start, end) {
    const sourceTower = towers[start];
    const destinationTower = towers[end];
    const isSourceTowerEmpty = sourceTower.length === 0;
    const isDestinationTowerEmpty = destinationTower.length === 0;

    if (isSourceTowerEmpty) {
      return;
    }
    const canMove =
      isDestinationTowerEmpty ||
      destinationTower[destinationTower.length - 1] > disk;

    if (canMove) {
      const newTowers = {
        ...towers,
        [start]: towers[start].filter((d) => d !== disk),
        [end]: [disk, ...towers[end]],
      };
      setTowers(newTowers);
      setNumMoves(numMoves + 1);
      checkGameWon(newTowers);
    }
  }

  function autoArrange() {
    if (gameWon) {
      return;
    }
    moveTower(numDisks, "A", "C", "B");
  }
  function resetGame() {
    setTowers({ A: [3, 2, 1], B: [], C: [] });
    setNumDisks(3);
    setNumMoves(0);
    setGameWon(false);
    clearInterval(intervalId); // clear the old interval
    setTime(0);
    const newIntervalId = setInterval(() => {
      setTime((time) => time + 1);
    }, 1000); // start a new interval
    setIntervalId(newIntervalId);
  }
  return (
    <div className="box-container">
      <h1>Tower of Hanoi</h1>
      <div className="container">
        <div className="controls">
          <div>
            <label htmlFor="num-disks" className="number">Number of disks:</label>
            <select
              id="num-disks"
              value={numDisks}
              onChange={handleNumDisksChange}
            >
              <option value="3">3 disks</option>
              <option value="4">4 disks</option>
              <option value="5">5 disks</option>
              <option value="6">6 disks</option>
              <option value="7">7 disks</option>
              <option value="8">8 disks</option>
              <option value="9">9 disks</option>
              <option value="10">10 disks</option>
            </select>
          </div>
          <div>Time: {formatTime(time)}</div>
        </div>
        <div className="game">
          <Tower
            disks={towers.A}
            onDragStart={handleDragStart}
            onDrop={(e) => handleDrop(e, "A")}
          />
          <Tower
            disks={towers.B}
            onDragStart={handleDragStart}
            onDrop={(e) => handleDrop(e, "B")}
          />
          <Tower
            disks={towers.C}
            onDragStart={handleDragStart}
            onDrop={(e) => handleDrop(e, "C")}
          />
        </div>
        <div className="controls">
          <div className="num-moves">Number of moves: {numMoves}</div>
          <div className="button-2">
            <button onClick={autoArrange} className="move">Move</button>
            <button onClick={resetGame} className="reset">Reset Game</button>
          </div>
          {gameWon && <div className="game-won">You won!</div>}
          
        </div>
        <div className="music">
      <select value={currentSong.name} onChange={handleSongSelect}>
        {musicList.map((song) => (
          <option key={song.name} value={song.name}>
            {song.name}
          </option>
        ))}
      </select>
      <button onClick={handlePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
    </div>
      </div>
     
    
    </div>
  );
}

export default TowerOfHanoi;
