// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox
} from '@material-ui/core';
import * as SettingsActions from '../actions/settings';
import styles from './SettingsDialog.css';

const Store = require('electron-store');

type Props = {
  open: boolean,
  onClose: () => void,

  store: Store,

  maxCacheSize: number,
  gridColumns: number,
  allowConcurrentAudio: boolean,

  setMaxCacheSize: (value: number) => void,
  setGridColumns: (value: number) => void,
  setAllowConcurrentAudio: (value: boolean) => void
};

type State = {
  gridColumnsInput: number,
  allowConcurrentAudioInput: boolean,
  maxCacheSizeInput: number
};

class SettingsDialog extends Component<Props, State> {
  props: Props;

  constructor(props: Props) {
    super(props);

    this.state = {
      gridColumnsInput: props.gridColumns,
      allowConcurrentAudioInput: props.allowConcurrentAudio,
      maxCacheSizeInput: props.maxCacheSize
    };
  }

  componentDidUpdate(nextProps: Props) {
    const { open } = this.props;
    if (nextProps.open !== open) {
      const { gridColumns, allowConcurrentAudio, maxCacheSize } = nextProps;
      this.updateInputValues(gridColumns, allowConcurrentAudio, maxCacheSize);
    }
  }

  updateInputValues(
    gridColumnsInput: number,
    allowConcurrentAudioInput: boolean,
    maxCacheSizeInput: number
  ) {
    this.setState({
      gridColumnsInput,
      allowConcurrentAudioInput,
      maxCacheSizeInput
    });
  }

  onCancel() {
    const {
      gridColumns,
      allowConcurrentAudio,
      maxCacheSize,
      onClose
    } = this.props;

    this.setState({
      gridColumnsInput: gridColumns,
      allowConcurrentAudioInput: allowConcurrentAudio,
      maxCacheSizeInput: maxCacheSize
    });

    if (onClose) {
      onClose();
    }
  }

  onSave() {
    const {
      setGridColumns,
      setAllowConcurrentAudio,
      setMaxCacheSize,
      onClose,
      store
    } = this.props;
    const {
      gridColumnsInput,
      allowConcurrentAudioInput,
      maxCacheSizeInput
    } = this.state;

    store.set('gridColumns', gridColumnsInput);
    store.set('allowConcurrentAudio', allowConcurrentAudioInput);
    store.set('maxCacheSize', maxCacheSizeInput);

    setGridColumns(gridColumnsInput);
    setAllowConcurrentAudio(allowConcurrentAudioInput);
    setMaxCacheSize(maxCacheSizeInput);

    if (onClose) {
      onClose();
    }
  }

  render() {
    const { open } = this.props;
    const {
      gridColumnsInput,
      allowConcurrentAudioInput,
      maxCacheSizeInput
    } = this.state;

    return (
      <Dialog
        maxWidth="md"
        onClose={() => {
          this.onCancel();
        }}
        aria-labelledby="settings-dialog-title"
        aria-describedby="settings-dialog-description"
        open={open}
      >
        <DialogTitle id="settings-dialog-title">Settings</DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <div id="settings-dialog-description">
            <form noValidate autoComplete="off">
              <Grid container className={styles.container}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="grid-columns-select-label">
                      Grid Columns
                    </InputLabel>
                    <Select
                      labelId="grid-columns-select-label"
                      id="grid-columns-select"
                      value={gridColumnsInput}
                      onChange={evt => {
                        this.setState({
                          gridColumnsInput: evt.target.value
                        });
                      }}
                    >
                      <MenuItem value={1}>One</MenuItem>
                      <MenuItem value={2}>Two</MenuItem>
                      <MenuItem value={3}>Three</MenuItem>
                      <MenuItem value={4}>Four</MenuItem>
                      <MenuItem value={6}>Six</MenuItem>
                      <MenuItem value={12}>Twelve</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allowConcurrentAudioInput}
                        onChange={evt => {
                          this.setState({
                            allowConcurrentAudioInput: evt.target.checked
                          });
                        }}
                        value="allowConcurrentAudio"
                        color="primary"
                      />
                    }
                    label="Allow Concurrent Audio"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      name="maxCacheSize"
                      label="Cache Size"
                      type="number"
                      variant="outlined"
                      value={maxCacheSizeInput}
                      onChange={evt => {
                        this.setState({
                          maxCacheSizeInput: evt.target.value
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </form>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.onCancel();
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              this.onSave();
            }}
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

function mapStateToProps(state) {
  const { settings } = state;
  return settings;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SettingsActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsDialog);
