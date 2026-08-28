import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Square, Search, RotateCcw, ArrowRight, Settings, Volume2, Music, Moon, X, RefreshCw, Crown } from 'lucide-react';
import './App.css';
import dbDHH from './db_dhh.json';
import dbBollywood from './db_bollywood.json';
import dbSpotify from './db_spotify.json';
import RainEffect from './RainEffect';
import Confetti from 'react-confetti';

const STAGES = [0.1, 0.5, 2, 8, 15]; // 5 stages for 5 guess boxes
const MAX_GUESSES = 5;
const GENRES = ['All', 'Bollywood', 'Desi Hip Hop'];

function App() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  // Parallax state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Audio offset to skip silences
  const [audioOffset, setAudioOffset] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeGenre, setActiveGenre] = useState('Desi Hip Hop');
  const [countdown, setCountdown] = useState(null);
  const [ytReady, setYtReady] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const [autoReroll, setAutoReroll] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showDonationBox, setShowDonationBox] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Show after initial delay, then toggle every 60s
    const timeout = setTimeout(() => setShowDonationBox(true), 600);
    const interval = setInterval(() => {
      setShowDonationBox(prev => !prev);
    }, 60000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // Dynamic Theme Colors
  useEffect(() => {
    const root = document.documentElement;
    if (activeGenre === 'Desi Hip Hop') {
      root.style.setProperty('--primary-color', '#00e5ff');
      root.style.setProperty('--primary-color-rgb', '0, 229, 255');
    } else if (activeGenre === 'Bollywood') {
      root.style.setProperty('--primary-color', '#ff2a5f');
      root.style.setProperty('--primary-color-rgb', '255, 42, 95');
    } else {
      root.style.setProperty('--primary-color', '#1ed760');
      root.style.setProperty('--primary-color-rgb', '30, 215, 96');
    }
  }, [activeGenre]);

  const playerRef = useRef(null);
  const allowedDuration = STAGES[Math.min(guesses.length, MAX_GUESSES - 1)];

  // Init YT
  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      setYtReady(true);
    };
    if (window.YT && window.YT.Player) {
      setYtReady(true);
    }
  }, []);

  // Parallax mouse tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Theme changer
  useEffect(() => {
    const root = document.documentElement;
    if (activeGenre === 'Bollywood') {
      root.style.setProperty('--primary-color', '#ff3366');
      root.style.setProperty('--primary-color-rgb', '255, 51, 102');
    } else if (activeGenre === 'Desi Hip Hop') {
      root.style.setProperty('--primary-color', '#00e5ff');
      root.style.setProperty('--primary-color-rgb', '0, 229, 255');
    } else {
      root.style.setProperty('--primary-color', '#29d96c');
      root.style.setProperty('--primary-color-rgb', '41, 217, 108');
    }
  }, [activeGenre]);

  useEffect(() => {
    fetchSongs(activeGenre);
  }, [activeGenre]);

  const fetchSongs = async (genre) => {
    setIsLoading(true);
    let validSongs = [];
    if (genre === 'Desi Hip Hop') {
      validSongs = [...(dbDHH || []), ...(dbSpotify || [])];
    } else if (genre === 'Bollywood') {
      validSongs = dbBollywood || [];
    } else {
      validSongs = [...(dbDHH || []), ...(dbBollywood || []), ...(dbSpotify || [])];
    }
    
    if (validSongs.length > 0) {
      setSongs(validSongs);
      startNewGame(validSongs);
    } else {
      setSongs([]);
    }
    setIsLoading(false);
  };

  const startNewGame = (songList = songs) => {
    if (!songList.length) return;
    
    let targetList = songList;
    if (activeGenre === 'All') {
      const isBollywood = Math.random() < 0.5;
      targetList = isBollywood ? (dbBollywood || []) : [...(dbDHH || []), ...(dbSpotify || [])];
      if (!targetList.length) targetList = songList;
    }
    
    let randomSong = targetList[Math.floor(Math.random() * targetList.length)];
    // Ensure we don't pick the same song twice in a row if possible
    if (targetList.length > 1 && currentSong) {
      while (randomSong.videoId === currentSong.videoId) {
        randomSong = targetList[Math.floor(Math.random() * targetList.length)];
      }
    }
    
    setCurrentSong(randomSong);
    setGuesses([]);
    setSearchInput('');
    setIsPlaying(false);
    setProgress(0);
    setCountdown(null);
    setAudioOffset(0);
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);
    
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
        if (typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(0, true);
        }
      } catch (e) {
        console.error("YT Player error on reset:", e);
      }
    }
  };

  const retryGame = () => {
    setGuesses([]);
    setSearchInput('');
    setIsPlaying(false);
    setProgress(0);
    setCountdown(null);
    setAudioOffset(0);
    
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
        if (typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(0, true);
        }
      } catch (e) {
        console.error("YT Player error on retry:", e);
      }
    }
  };

  // YT Player load
  useEffect(() => {
    if (!ytReady || !currentSong || !currentSong.videoId) return;
    
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById({
        videoId: currentSong.videoId,
        startSeconds: 0
      });
      playerRef.current.pauseVideo();
    } else if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player('yt-player-container', {
        height: '200',
        width: '200',
        videoId: currentSong.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume * 100);
          }
        }
      });
    }
  }, [currentSong, ytReady]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  const isWin = guesses.length > 0 && guesses[guesses.length - 1].type === 'correct';
  const isLoss = guesses.length >= MAX_GUESSES && !isWin;
  const isGameOver = isWin || isLoss;
  const winStageTime = isWin ? STAGES[guesses.length - 1] : 0;

  const togglePlay = () => {
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function' || !currentSong) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      if (playerRef.current && playerRef.current.seekTo) {
        // If progress is at allowedDuration, restart from 0
        const currentProgress = progress;
        if (!isGameOver && currentProgress >= allowedDuration - 0.05) {
          setProgress(0);
          playerRef.current.seekTo(audioOffset, true);
        } else {
          playerRef.current.seekTo(audioOffset + currentProgress, true);
        }
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleProgressClick = (e) => {
    if (!playerRef.current || typeof playerRef.current.seekTo !== 'function' || !currentSong) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    
    // Map clickPercent back to seconds
    const stageIndex = Math.min(4, Math.floor(clickPercent / 20));
    const fraction = (clickPercent % 20) / 20;
    const prevTime = stageIndex === 0 ? 0 : STAGES[stageIndex - 1];
    const stageDuration = STAGES[stageIndex] - prevTime;
    let clickTime = prevTime + fraction * stageDuration;
    
    if (!isGameOver && clickTime > allowedDuration) {
      clickTime = allowedDuration;
    }
    
    setProgress(clickTime);
    playerRef.current.seekTo(audioOffset + clickTime, true);
    if (!isPlaying) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    let interval;
    if (isPlaying && playerRef.current && playerRef.current.getCurrentTime) {
      interval = setInterval(() => {
        const current = playerRef.current.getCurrentTime();
        const baseTime = audioOffset;
        
        if (!isGameOver && current - baseTime >= allowedDuration) {
          playerRef.current.pauseVideo();
          playerRef.current.seekTo(baseTime + allowedDuration, true);
          setIsPlaying(false);
          setProgress(allowedDuration);
        } else if (!isGameOver) {
          setProgress(Math.max(0, current - baseTime));
        } else {
          // game is over, let it play and fill progress
          setProgress(15);
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, allowedDuration, audioOffset, isGameOver]);


  const filteredSongs = useMemo(() => {
    if (!searchInput) return [];
    const query = searchInput.toLowerCase();
    return songs
      .filter(s => s.name.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query))
      .slice(0, 50);
  }, [searchInput, songs]);

  const handleGuess = (songName) => {
    const guessedSong = songs.find(s => s.name.toLowerCase() === songName.toLowerCase());
    const isCorrect = guessedSong && guessedSong.name.toLowerCase() === currentSong.name.toLowerCase();
    
    let type = 'incorrect';
    if (isCorrect) {
      type = 'correct';
    } else if (guessedSong) {
      const guessedArtists = guessedSong.artist.toLowerCase().split(',').map(a => a.trim());
      const correctArtists = currentSong.artist.toLowerCase().split(',').map(a => a.trim());
      const hasCommonArtist = guessedArtists.some(a => correctArtists.includes(a));
      if (hasCommonArtist) {
        type = 'partial';
      }
    }

    setGuesses([...guesses, { type, text: songName }]);
    setSearchInput('');
    setShowAutocomplete(false);
    
    if (isCorrect) {
      setStreak(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } else if (guesses.length + 1 >= MAX_GUESSES) {
      setStreak(0);
    }
  };

  const handleSkip = () => {
    setGuesses([...guesses, { type: 'skip', text: 'ghee khatam ?' }]);
    setSearchInput('');
    if (guesses.length + 1 >= MAX_GUESSES) {
      setStreak(0);
    }
  };

  useEffect(() => {
    if ((isWin || isLoss) && autoReroll) {
      setCountdown(4);
    } else if (isWin || isLoss) {
      setCountdown(null);
    }
  }, [isWin, isLoss, autoReroll]);

  useEffect(() => {
    if (isGameOver && playerRef.current) {
      playerRef.current.setVolume(50);
      if (!isPlaying && playerRef.current.playVideo) {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else if (!isGameOver && playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume * 100);
    }
  }, [isGameOver, volume, isPlaying]);

  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      startNewGame();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const visualProgress = useMemo(() => {
    if (progress >= 15) return 100;
    for (let i = 0; i < STAGES.length; i++) {
      if (progress <= STAGES[i]) {
        const prevTime = i === 0 ? 0 : STAGES[i-1];
        const stageDuration = STAGES[i] - prevTime;
        const progressInStage = (progress - prevTime) / stageDuration;
        return (i * 20) + (progressInStage * 20);
      }
    }
    return 0;
  }, [progress]);

  if (isLoading || !currentSong) {
    return <div className="layout">Loading songs...</div>;
  }

  return (
    <div className="layout">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}

      {/* Parallax Background */}
      <div 
        className="parallax-bg" 
        style={{ transform: `translate(${mousePos.x * -1.5}%, ${mousePos.y * -1.5}%)` }}
      ></div>
      <RainEffect />

      {/* Top Right Header Buttons */}
      <div className="header-buttons">
        <button 
          className={`header-btn ${audioOffset === 10 ? 'active-offset' : ''}`}
          style={{ width: 'auto', padding: '0 15px', fontSize: '0.9rem' }}
          onClick={() => setAudioOffset(o => o === 10 ? 0 : 10)} 
          title="Skip first 10s"
        >
          +10s
        </button>
        <button 
          className={`header-btn ${audioOffset === 20 ? 'active-offset' : ''}`}
          style={{ width: 'auto', padding: '0 15px', fontSize: '0.9rem' }}
          onClick={() => setAudioOffset(o => o === 20 ? 0 : 20)} 
          title="Skip first 20s"
        >
          +20s
        </button>
        <button className="header-btn" onClick={() => startNewGame()} title="Reroll Song">
          <RefreshCw size={20} className={isSpinning ? 'spin-anim' : ''} />
        </button>
        <button className="header-btn" onClick={() => setShowRules(true)}>?</button>
        <button className="header-btn" onClick={() => setShowSettings(true)} title="Preferences">
          <Settings size={20} />
        </button>
      </div>

      {/* Donation Box */}
      <div className={`donation-box ${showDonationBox ? 'visible' : 'hidden'}`}>
        <div style={{ position: 'relative' }}>
          <Crown size={32} color="#FFD700" fill="#FFD700" style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%) rotate(15deg)', zIndex: 2, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          <div className="donation-img-wrapper">
            <img src="/subashree.png" alt="Queen" className="donation-img" />
          </div>
        </div>
        <p className="donation-text">SUPPORT FOR QUEEN</p>
        <button className="donation-btn" onClick={() => setShowQR(true)}>Donate Now</button>
      </div>

      <div className="main-content">
        
        <div className="taunt-text">
          CUTU TERE BASKI NAHI <span style={{color: 'var(--primary-color)'}}>GUESS</span> KARNA
        </div>

        <div className="game-body">
          <div className="genre-toggle-group">
          {GENRES.map(genre => {
            const btnColor = genre === 'All' ? '#29d96c' : genre === 'Bollywood' ? '#ff3366' : '#00e5ff';
            return (
              <button 
                key={genre}
                className={`genre-toggle-btn ${activeGenre === genre ? 'active' : ''}`}
                style={{ '--btn-theme-color': btnColor }}
                onClick={() => setActiveGenre(genre)}
              >
                {genre}
              </button>
            );
          })}
        </div>

        <div className="guesses-container">
          {Array.from({ length: MAX_GUESSES }).map((_, i) => {
            const guess = guesses[i];
            let boxClass = 'guess-box';
            let content = '';
            
            if (guess) {
              if (guess.type === 'skip') {
                boxClass += ' skip';
                content = 'ghee khatam ?';
              } else if (guess.type === 'correct') {
                boxClass += ' correct';
                content = guess.text;
              } else if (guess.type === 'partial') {
                boxClass += ' partial';
                content = guess.text;
              } else {
                boxClass += ' incorrect';
                content = guess.text;
              }
            }
            
            return (
              <div key={i} className={boxClass}>
                {content}
              </div>
            );
          })}
        </div>

        <div className="timeline-wrapper">
          <div className="progress-bar-container" onClick={handleProgressClick} style={{ cursor: 'pointer' }}>
             {STAGES.map((time, i) => {
                return <div key={i} className="progress-segment" style={{ width: `20%` }}></div>
             })}
             <div className="progress-fill" style={{ width: `${visualProgress}%` }}></div>
          </div>
          <div className="progress-triangle" style={{ left: `${visualProgress}%` }}></div>
          {progress > 0 && (
             <div className="duration-text" style={{ left: `${visualProgress}%` }}>
               {Math.ceil(progress)}s
             </div>
          )}
        </div>

        {/* Play Button Area */}
        {!isGameOver && (
          <div className="play-wrapper">
            {/* Streak Counter */}
            {streak > 0 && (
              <div className="streak-counter" key={streak}>
                🔥 Streak: {streak}
              </div>
            )}
            <button className={`giant-play-btn ${isPlaying ? 'playing' : ''}`} onClick={togglePlay}>
              {isPlaying ? <Square fill="currentColor" size={32} /> : <Play fill="currentColor" size={36} style={{marginLeft: '6px'}} />}
            </button>
          </div>
        )}

        <div className="search-skip-row" style={{ opacity: isGameOver ? 0.5 : 1, pointerEvents: isGameOver ? 'none' : 'auto' }}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              className="search-input" 
              placeholder="Search a song" 
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setShowAutocomplete(true); }}
            />
            {showAutocomplete && filteredSongs.length > 0 && (
              <div className="autocomplete-dropdown">
                {filteredSongs.map((s, i) => (
                  <div key={i} className="autocomplete-item" onClick={() => handleGuess(s.name)}>
                    {s.cover && <img src={s.cover} className="autocomplete-img" alt="cover" />}
                    <div>
                      <div style={{fontWeight: 600}}>{s.name}</div>
                      <div style={{fontSize: '0.8rem', color: '#a0a0a0'}}>{s.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="skip-btn" onClick={handleSkip}>
             Skip
          </button>
        </div>
        
        </div>

        {/* Hidden YT Player */}
        <div style={{position: 'absolute', width: '200px', height: '200px', opacity: 0, pointerEvents: 'none', zIndex: -100}}>
           <div id="yt-player-container"></div>
        </div>

      </div>

      {/* 3D Win/Loss Modal Overlay */}
      {isGameOver && (
        <div className="result-overlay">
          <div className="result-card-3d">
            <div className={`result-title-3d ${isWin ? 'win-text' : 'loss-text'}`}>
              {isWin ? 'YOU WON!' : 'YOU LOST!'}
            </div>
            
            {currentSong.cover && <img src={currentSong.cover} alt="Cover" className="result-cover-3d" />}
            
            <div className="result-song-3d">{currentSong.name}</div>
            <div className="result-artist-3d">{currentSong.artist}</div>
            
            <div style={{display: 'flex', gap: '1rem', transform: 'translateZ(50px)'}}>
              <button className="btn-retry-3d" onClick={retryGame}>
                <RotateCcw size={20} /> RETRY
              </button>
              <button className="btn-next-3d" onClick={() => startNewGame()}>
                NEXT SONG <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* RULES MODAL */}
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRules(false)}><X size={24} /></button>
            <div className="modal-title">How to Play</div>
            <div className="modal-subtitle">Listen to a snippet. Guess the song wrong answers unlock more.</div>
            
            <div className="rules-legend">
              <div className="legend-blocks">
                <div className="l-block" style={{background: '#29d96c'}}></div>
                <div className="l-block" style={{background: '#a0a0a0'}}></div>
                <div className="l-block"></div>
                <div className="l-block"></div>
                <div className="l-block"></div>
                <div className="l-block"></div>
              </div>
              
              <div className="legend-row">
                <div className="legend-icon-btn"><Play size={16} fill="currentColor" style={{marginLeft: '2px'}}/></div>
                <div>Play the current snippet</div>
              </div>
              
              <div className="legend-row" style={{borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem'}}>
                <div className="legend-skip-btn">Next</div>
                <div>Skip to next snippet</div>
              </div>
              
              <div className="legend-row" style={{marginTop: '1rem'}}>
                <div className="legend-color-box" style={{background: '#d92929'}}></div>
                <div>Wrong artist & song</div>
              </div>
              
              <div className="legend-row">
                <div className="legend-color-box" style={{background: '#d9b829'}}></div>
                <div>Right artist, wrong song</div>
              </div>
              
              <div className="legend-row">
                <div className="legend-color-box" style={{background: '#29d96c'}}></div>
                <div>Got it!</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSettings(false)}><X size={24} /></button>
            <div className="modal-title" style={{textAlign: 'left', marginBottom: '1.5rem'}}>Preferences</div>
            
            <div className="settings-row-col">
              <div className="settings-label"><Volume2 size={20} /> Song Audio</div>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div className="slider-val">{Math.round(volume * 100)}%</div>
                <input 
                  type="range" 
                  min="0" max="1" step="0.01" 
                  value={volume} 
                  onChange={e => setVolume(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-label"><RefreshCw size={20} /> Auto Reroll</div>
              <div className={`toggle-switch ${autoReroll ? 'active' : ''}`} onClick={() => setAutoReroll(!autoReroll)}></div>
            </div>
            


          </div>
        </div>
      )}
      
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowQR(false)}>
              <X size={24} />
            </button>
            <h2 className="modal-title">Scan to Support</h2>
            <img src="/qr.png" alt="UPI QR Code" style={{width: '100%', maxWidth: '300px', margin: '0 auto', display: 'block', borderRadius: '8px', border: '2px solid #29d96c'}} />
          </div>
        </div>
      )}

      {/* LOSS OVERLAY */}
      {isLoss && (
        <div className="loss-overlay">
          <div className="loss-content">
            {currentSong.cover && <img src={currentSong.cover} alt="Cover" className="loss-cover" />}
            <div className="loss-title">{currentSong.name}</div>
            <div className="loss-artist">{currentSong.artist}</div>
            <div className="loss-badge">IT WAS...</div>
            
            <div className="loss-buttons">
              <button className="btn-retry" onClick={() => {
                setGuesses([]);
                setSearchInput('');
                setIsPlaying(false);
                setProgress(0);
                if (playerRef.current && playerRef.current.pauseVideo) {
                  playerRef.current.pauseVideo();
                  playerRef.current.seekTo(audioOffset, true);
                }
              }}>
                <RotateCcw size={16} /> Retry
              </button>
              <button className="btn-next" onClick={() => startNewGame()}>
                Next song <ArrowRight size={16} />
              </button>
            </div>
            
            {countdown !== null && countdown > 0 && (
              <div className="auto-next-row" style={{marginTop: '1.5rem'}}>
                Next song in {countdown}s 
                <button className="cancel-btn" onClick={() => setCountdown(null)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WIN OVERLAY */}
      {isWin && (
        <div className="win-overlay">
          <div className="loss-content">
            {currentSong.cover && <img src={currentSong.cover} alt="Cover" className="win-cover-large" />}
            <div className="loss-title" style={{textTransform: 'uppercase'}}>{currentSong.name}</div>
            <div className="loss-artist">{currentSong.artist}</div>
            <div className="win-badge">GUESSED IN {winStageTime}S!</div>
            
            <button className="btn-win-next" onClick={() => startNewGame()}>
              Next song <ArrowRight size={16} />
            </button>
            
            {countdown !== null && countdown > 0 && (
              <div className="auto-next-row">
                Next song in {countdown}s 
                <button className="cancel-btn" onClick={() => setCountdown(null)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
