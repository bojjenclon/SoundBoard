// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Chip,
  Container,
  Grid,
  Tooltip,
  Zoom
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import SettingsIcon from '@material-ui/icons/Settings';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Howl } from 'howler';
import * as SettingsActions from '../actions/settings';
// import routes from '../constants/routes.json';
import styles from './Home.css';
import SettingsDialog from './SettingsDialog';
import AddSoundDialog from './AddSoundDialog';
import SoundOptionsDialog from './SoundOptionsDialog';

const { globalShortcut } = require('electron').remote;
const uuidv4 = require('uuid/v4');
const Store = require('electron-store');

type Settings = {
  maxCacheSize: number,
  gridColumns: number,
  allowConcurrentAudio: boolean
};

type Sound = {
  id: string,
  name: string,
  path: string,
  shortcut: string,
  howl: Howl
};

type Props = {
  settings: Settings,

  setMaxCacheSize: (value: number) => void,
  setGridColumns: (value: number) => void,
  setAllowConcurrentAudio: (value: boolean) => void
};

type State = {
  store: Store,

  sounds: Array<Sound>,
  soundLoaded: { [key: string]: boolean },
  soundCache: Array<Sound>,
  soundsPlaying: Array<Howl>,
  shortcutsRegistered: { [key: string]: Sound },

  settingsOpen: boolean,
  addSoundOpen: boolean,
  soundOptionsOpen: boolean,

  selectedSound: ?Sound
};

class Home extends Component<Props, State> {
  props: Props;

  constructor(props: Props) {
    super(props);

    this.state = {
      store: new Store(),

      sounds: [],
      soundLoaded: {},
      soundCache: [],
      soundsPlaying: [],
      shortcutsRegistered: {},

      settingsOpen: false,
      addSoundOpen: false,
      soundOptionsOpen: false,

      selectedSound: null
    };
  }

  componentDidMount() {
    const {
      settings,
      setGridColumns,
      setAllowConcurrentAudio,
      setMaxCacheSize
    } = this.props;
    const { store } = this.state;
    const storedSounds = store.get('sounds', {});
    const storedIDs = Object.keys(storedSounds);

    storedIDs.forEach(id => {
      const sound = storedSounds[id];
      const { name, path, shortcut } = sound;

      this.addSound(id, name, path, shortcut, false);
    });

    setGridColumns(store.get('gridColumns', settings.gridColumns));
    setAllowConcurrentAudio(
      store.get('allowConcurrentAudio', settings.allowConcurrentAudio)
    );
    setMaxCacheSize(store.get('maxCacheSize', settings.maxCacheSize));
  }

  onSoundLoaded(sound: Sound) {
    const { settings } = this.props;
    const { soundLoaded, soundCache } = this.state;

    while (soundCache.length >= settings.maxCacheSize) {
      const snd = soundCache.shift();
      soundLoaded[snd.id] = false;
      const { howl } = snd;
      howl.unload();
    }

    soundLoaded[sound.id] = true;
    soundCache.push(sound);

    this.setState({
      soundLoaded,
      soundCache
    });
  }

  onSoundPlayed(sound: Sound) {
    const { settings } = this.props;
    const { allowConcurrentAudio } = settings;

    let { soundsPlaying } = this.state;

    const { howl } = sound;

    if (!allowConcurrentAudio) {
      soundsPlaying.forEach(snd => {
        if (snd !== howl) {
          snd.stop();
        }
      });
      soundsPlaying = [];
    }

    soundsPlaying.push(howl);

    this.setState({
      soundsPlaying
    });
  }

  onSoundEnded(sound: Sound) {
    const { soundsPlaying } = this.state;
    const { howl } = sound;

    soundsPlaying.splice(soundsPlaying.indexOf(howl), 1);

    this.setState({
      soundsPlaying
    });
  }

  addSound(
    id: ?string,
    name: string,
    path: string,
    shortcut: string = '',
    addToStore: boolean = true
  ) {
    const { store, sounds, soundLoaded, shortcutsRegistered } = this.state;

    const howl = new Howl({
      src: [path],
      preload: false
    });

    const snd = {
      id: id || uuidv4(),
      name,
      path,
      shortcut,
      howl
    };

    howl.on('load', this.onSoundLoaded.bind(this, snd));
    howl.on('play', this.onSoundPlayed.bind(this, snd));
    howl.on('end', this.onSoundEnded.bind(this, snd));

    if (addToStore) {
      const storedSounds = store.get('sounds', {});
      storedSounds[snd.id] = {
        name,
        path,
        shortcut
      };
      store.set('sounds', storedSounds);
    }

    sounds.push(snd);
    soundLoaded[snd.id] = false;

    if (!!shortcut && !!shortcut.length) {
      globalShortcut.register(shortcut, () => {
        this.playSound(snd);
      });

      shortcutsRegistered[shortcut] = snd;
    }

    this.setState({
      sounds,
      soundLoaded
    });
  }

  // eslint-disable-next-line class-methods-use-this
  playSound(sound: Sound) {
    const { howl } = sound;
    const howlState = howl.state();
    const isPlaying = howl.playing();

    if (howlState === 'unloaded') {
      howl.load();
    } else if (howlState === 'loaded' && !isPlaying) {
      howl.play();
    }
  }

  registerShortcuts() {
    const { shortcutsRegistered } = this.state;

    const registeredKeys = Object.keys(shortcutsRegistered);
    registeredKeys.forEach(key => {
      const snd = shortcutsRegistered[key];
      globalShortcut.register(key, () => {
        this.playSound(snd);
      });
    });
  }

  render() {
    const { settings } = this.props;
    const { allowConcurrentAudio, gridColumns, maxCacheSize } = settings;
    const columnSize = 12 / gridColumns;

    const {
      store,
      sounds,
      soundLoaded,
      soundCache,
      shortcutsRegistered,
      settingsOpen,
      addSoundOpen,
      soundOptionsOpen,
      selectedSound
    } = this.state;

    return (
      <div className={styles.root} data-tid="container">
        <SettingsDialog
          maxCacheSize={maxCacheSize}
          gridColumns={gridColumns}
          allowConcurrentAudio={allowConcurrentAudio}
          open={settingsOpen}
          store={store}
          onClose={() => {
            this.registerShortcuts();

            this.setState({
              settingsOpen: false
            });
          }}
        />

        <AddSoundDialog
          open={addSoundOpen}
          onClose={() => {
            this.registerShortcuts();

            this.setState({
              addSoundOpen: false
            });
          }}
          onSave={(name, path, shortcut) => {
            if (!!name && !!path) {
              this.addSound(null, name, path, shortcut);
            }

            this.setState({
              addSoundOpen: false
            });
          }}
          isShortcutUsed={accelerator => {
            return accelerator in shortcutsRegistered;
          }}
        />

        <SoundOptionsDialog
          open={soundOptionsOpen}
          store={store}
          sound={selectedSound}
          onClose={() => {
            this.registerShortcuts();

            this.setState({
              soundOptionsOpen: false,
              selectedSound: null
            });
          }}
          onDelete={() => {
            if (!selectedSound) {
              return;
            }

            const { howl } = selectedSound;
            if (howl.state() === 'loaded') {
              // Unload the Howl object
              howl.unload();

              // Remove this sound from the loaded array
              delete soundLoaded[selectedSound.id];

              // Delete this sound from the queue
              soundCache.splice(soundCache.indexOf(selectedSound, 1));
            }

            // Remove this sound from the main sound array
            sounds.splice(sounds.indexOf(selectedSound), 1);

            this.setState({
              sounds,
              soundLoaded,
              soundCache
            });
          }}
        />

        <AppBar position="static" className={styles.header}>
          <Toolbar>
            <Tooltip
              TransitionComponent={Zoom}
              enterDelay={500}
              title="Settings"
            >
              <IconButton
                aria-label="settings"
                color="inherit"
                onClick={() => {
                  globalShortcut.unregisterAll();

                  this.setState({
                    settingsOpen: true
                  });
                }}
                style={{ marginRight: '4px' }}
              >
                <SettingsIcon fontSize="large" />
              </IconButton>
            </Tooltip>

            <Typography variant="h4" className={styles.title}>
              SoundBoard
            </Typography>

            <Tooltip
              TransitionComponent={Zoom}
              enterDelay={500}
              title="Add Sound"
            >
              <IconButton
                aria-label="settings"
                color="inherit"
                onClick={() => {
                  globalShortcut.unregisterAll();

                  this.setState({
                    addSoundOpen: true
                  });
                }}
              >
                <AddCircleIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Container>
          <Grid container spacing={2}>
            {sounds.map(snd => (
              <Grid
                key={snd.id}
                item
                xs={columnSize}
                style={{ textAlign: 'center' }}
              >
                <Tooltip
                  TransitionComponent={Zoom}
                  enterDelay={500}
                  title={snd.name}
                >
                  <Chip
                    label={snd.name}
                    color={soundLoaded[snd.id] ? 'primary' : 'default'}
                    clickable
                    onClick={() => this.playSound(snd)}
                    onDelete={() => {
                      globalShortcut.unregisterAll();

                      this.setState({
                        soundOptionsOpen: true,
                        selectedSound: snd
                      });
                    }}
                    deleteIcon={<InfoIcon />}
                    style={{
                      overflowX: 'hidden',
                      whitwSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}
                  />
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { settings } = state;
  return {
    settings
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SettingsActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
