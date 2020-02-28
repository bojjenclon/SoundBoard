import { spy } from 'sinon';
import * as actions from '../../app/actions/settings';

describe('actions', () => {
  it('should create max cache size setter action with appropriate value', () => {
    expect(actions.setMaxCacheSize(15)).toMatchSnapshot();
  });

  it('should create grid columns setter action with appropriate value', () => {
    expect(actions.setGridColumns(3)).toMatchSnapshot();
  });

  it('should create allow concurrent audio setter action with appropriate value', () => {
    expect(actions.setAllowConcurrentAudio(true)).toMatchSnapshot();
  });
});
