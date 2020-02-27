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
  TextField,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import AttachFileIcon from '@material-ui/icons/AttachFile';

type Props = {
  open: boolean,

  onClose: () => void,
  onSave: (name: string, path: string, shortcut: string) => void,

  isShortcutUsed: (accelerator: string) => boolean
};

type State = {
  soundName: string,
  soundPath: string,
  keyboardShortcut: string,

  nameError: boolean,
  pathError: boolean,
  shortcutError: boolean
};

class AddSoundDialog extends Component<Props, State> {
  props: Props;

  constructor(props: Props) {
    super(props);

    this.fileInput = React.createRef();

    this.state = {
      soundName: '',
      soundPath: '',
      keyboardShortcut: '',

      nameError: false,
      pathError: false,
      shortcutError: false
    };
  }

  onCancel() {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }

    this.setState({
      soundName: '',
      soundPath: '',
      keyboardShortcut: '',

      nameError: false,
      pathError: false,
      shortcutError: false
    });
  }

  onAdd() {
    const { onClose, onSave, isShortcutUsed } = this.props;
    const { soundName, soundPath, keyboardShortcut } = this.state;

    if (!soundName || !soundName.length) {
      this.setState({
        nameError: true
      });

      return;
    }

    if (!soundPath || !soundPath.length) {
      this.setState({
        pathError: true
      });

      return;
    }

    // A keyboard shortcut is optional, but if one is defined
    // it should be unique across all the existing sounds.
    if (
      keyboardShortcut &&
      !!keyboardShortcut.length &&
      isShortcutUsed(keyboardShortcut)
    ) {
      this.setState({
        shortcutError: true
      });

      return;
    }

    if (onSave) {
      onSave(soundName, soundPath, keyboardShortcut);
    }

    if (onClose) {
      onClose();
    }

    this.setState({
      soundName: '',
      soundPath: '',
      keyboardShortcut: '',

      nameError: false,
      pathError: false,
      shortcutError: false
    });
  }

  render() {
    const { open } = this.props;
    const {
      soundName,
      soundPath,
      keyboardShortcut,
      nameError,
      pathError,
      shortcutError
    } = this.state;

    return (
      <Dialog
        disableBackdropClick
        maxWidth="md"
        onClose={() => {
          this.onCancel();
        }}
        aria-labelledby="settings-dialog-title"
        aria-describedby="settings-dialog-description"
        open={open}
      >
        <DialogTitle id="settings-dialog-title">Sound Info</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <TextField
                  name="soundName"
                  label="Name"
                  variant="outlined"
                  value={soundName}
                  error={nameError}
                  onChange={evt => {
                    const { value } = evt.target;

                    this.setState({
                      soundName: value,
                      nameError: !value || !value.length
                    });
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <TextField
                  name="soundPath"
                  label="Path"
                  variant="outlined"
                  value={soundPath}
                  error={pathError}
                  onClick={evt => {
                    evt.stopPropagation();

                    const fileInput = this.fileInput.current;
                    fileInput.click();
                  }}
                  InputProps={{
                    inputProps: {
                      readOnly: true
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={evt => {
                            evt.stopPropagation();

                            const fileInput = this.fileInput.current;
                            fileInput.click();
                          }}
                        >
                          <AttachFileIcon />
                          <input
                            ref={this.fileInput}
                            type="file"
                            accept="audio/*"
                            style={{ display: 'none' }}
                            onChange={() => {
                              const fileInput = this.fileInput.current;
                              const { files } = fileInput;

                              if (files && !!files.length) {
                                const audioFile = files[0];

                                this.setState({
                                  soundPath: audioFile.path,
                                  pathError: false
                                });
                              }
                            }}
                          />
                        </IconButton>
                      </InputAdornment>
                    )
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
                  value={`${keyboardShortcut}`}
                  error={shortcutError}
                  onKeyDown={evt => {
                    const keyCode = evt.which || evt.keyCode;

                    const accelerator = [];
                    if (evt.ctrlKey || evt.metaKey) {
                      accelerator.push('CommandOrControl');
                    }
                    if (evt.shiftKey) {
                      accelerator.push('Shift');
                    }
                    if (evt.altKey) {
                      accelerator.push('Alt');
                    }

                    const invalidKeys = [9, 16, 17, 18];
                    if (invalidKeys.indexOf(keyCode) === -1) {
                      accelerator.push(evt.key.toUpperCase());

                      evt.preventDefault();

                      this.setState({
                        keyboardShortcut: accelerator.join('+')
                      });
                    }
                  }}
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
            color="default"
            variant="contained"
            onClick={() => {
              this.onCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              this.onAdd();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default AddSoundDialog;
