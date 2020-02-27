// @flow
import React, { Component } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Button,
  FormControl,
  TextField
} from '@material-ui/core';
import { Howl } from 'howler';
import styles from './SoundOptionsDialog.css';

const Store = require('electron-store');

type Sound = {
  id: string,
  name: string,
  path: string,
  shortcut: string,
  howl: Howl
};

type Props = {
  open: boolean,
  onDelete: () => void,
  onClose: () => void,

  store: Store,

  sound: ?Sound
};

type State = {};

class SoundOptionsDialog extends Component<Props, State> {
  props: Props;

  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  onDelete() {
    const { store, sound, onDelete, onClose } = this.props;

    if (sound) {
      store.delete(`sounds.${sound.id}`);
    }

    if (onDelete) {
      onDelete();
    }

    if (onClose) {
      onClose();
    }
  }

  onDone() {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }
  }

  render() {
    const { open, sound } = this.props;

    if (!sound) {
      return null;
    }

    return (
      <Dialog
        maxWidth="md"
        onClose={() => {
          this.onDone();
        }}
        aria-labelledby="settings-dialog-title"
        aria-describedby="settings-dialog-description"
        open={open}
      >
        <DialogTitle id="settings-dialog-title">Sound Info</DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <TextField
                  name="soundName"
                  label="Name"
                  variant="outlined"
                  defaultValue={sound.name}
                  InputProps={{
                    inputProps: {
                      readOnly: true
                    }
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <TextField
                  // inputRef={ref => {
                  //   const input = ref;
                  //   if (input) {
                  //     input.focus();
                  //     input.scrollLeft = input.scrollWidth;
                  //   }
                  // }}
                  name="soundPath"
                  label="Path"
                  variant="outlined"
                  defaultValue={sound.path}
                  InputProps={{
                    inputProps: {
                      readOnly: true
                    }
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <TextField
                  name="keyboardShortcut"
                  label="Shortcut"
                  variant="outlined"
                  defaultValue={sound.shortcut}
                  InputProps={{
                    inputProps: {
                      readOnly: true
                    }
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              this.onDelete();
            }}
            className={styles.deleteButton}
          >
            Delete
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              this.onDone();
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default SoundOptionsDialog;
