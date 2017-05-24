import Ember from 'ember';
import layout from '../templates/components/sticky-element';

const { computed, run: { scheduleOnce } } = Ember;

export default Ember.Component.extend({
  layout,
  attributeBindings: ['style'],
  classNameBindings: ['isStickyBottom'],
  /**
   * The offset from the top of the viewport when to start sticking to the top
   *
   * @property top
   * @type {number}
   * @default 0
   * @public
   */
  top: 0,

  /**
   * The offset from the parents bottom edge when to start sticking to the bottom of the parent
   * When `null` (default) sticking to the bottom is disabled. Use 0 or any other appropriate offset to enable it.
   *
   * @property bottom
   * @type {boolean|null}
   * @public
   */
  bottom: null,

  /**
   * @property isSticky
   * @type {boolean}
   * @readOnly
   * @private
   */
  isSticky: computed.or('isStickyTop', 'isStickyBottom').readOnly(),

  /**
   * @property isStickyTop
   * @type {boolean}
   * @readOnly
   * @private
   */
  isStickyTop: computed('parentTop', 'parentBottom', 'isStickyBottom', function() {
    return this.get('parentTop') === 'top' && !this.get('isStickyBottom');
  }).readOnly(),

  /**
   * @property isStickyBottom
   * @type {boolean}
   * @readOnly
   * @private
   */
  isStickyBottom: computed('parentBottom', 'parentTop', 'stickToBottom', function() {
      return this.get('parentBottom') === 'bottom'
      && this.get('parentTop') !== 'in'
      && this.get('stickToBottom');
  }).readOnly(),

  /**
   * @property parentTop
   * @type {string}
   * @private
   */
  parentTop: 'bottom',

  /**
   * @property parentBottom
   * @type {string}
   * @private
   */
  parentBottom: 'bottom',

  /**
   * @property ownHeight
   * @type {number}
   * @private
   */
  ownHeight: 0,

  /**
   * @property ownWidth
   * @type {number}
   * @private
   */
  ownWidth: 0,

  /**
   * @property stickToBottom
   * @type {boolean}
   * @readOnly
   * @private
   */
  stickToBottom: computed.notEmpty('bottom').readOnly(),

  /**
   * @property windowHeight
   * @type {number}
   * @private
   */
  windowHeight: 0,

  /**
   * @property offsetBottom
   * @type {number}
   * @private
   */
  offsetBottom: computed('top', 'ownHeight', 'bottom', 'windowHeight', function() {
    let { top, ownHeight, bottom, windowHeight } = this.getProperties('top', 'ownHeight', 'bottom', 'windowHeight');
    return (windowHeight - top - ownHeight - bottom);
  }),

  /**
   * Dynamic style for the components element
   *
   * @property style
   * @type {string}
   * @private
   */
  style: computed('isSticky', 'ownHeight', 'ownWidth', function() {
    let height = this.get('ownHeight');
    let width = this.get('ownWidth');
    if (height > 0 && this.get('isSticky')) {
      return Ember.String.htmlSafe(`height: ${height}px; width: ${width}px`);
    }
  }),

  /**
   * Dynamic style for the sticky container (`position: fixed`)
   *
   * @property containerStyle
   * @type {string}
   * @private
   */
  containerStyle: computed('isStickyTop', 'isStickyBottom', 'top', 'bottom', function() {
    if (this.get('isStickyBottom')) {
      let style = `position: fixed; bottom: ${this.get('bottom')}px; width: ${this.get('ownWidth')}px`;
      return Ember.String.htmlSafe(style);
    }
    if (this.get('isStickyTop')) {
      let style = `position: fixed; top: ${this.get('top')}px; width: ${this.get('ownWidth')}px`;
      return Ember.String.htmlSafe(style);
    }
  }),

  /**
   * @method updateDimension
   * @private
   */
  updateDimension() {
    this.set('windowHeight', Ember.$(window).height());
    this.set('ownHeight', this.$().height());
    this.set('ownWidth', this.$().width());
  },

  didInsertElement() {
    this._super(...arguments);
    scheduleOnce('afterRender', this, this.updateDimension);
  },

  actions: {
    parentTopEntered() {
      // console.log('parentTopEntered');
      this.set('parentTop', 'in');
    },
    parentTopExited(top) {
      // make sure we captured the right dimensions before getting sticky!
      this.updateDimension();
      // console.log('parentTopExited', top);
      this.set('parentTop', top ? 'top' : 'bottom');
    },
    parentBottomEntered() {
      // console.log('parentBottomEntered');
      this.set('parentBottom', 'in');
    },
    parentBottomExited(top) {
      console.log('parentBottomExited', top);
      this.set('parentBottom', top ? 'top' : 'bottom');
    }
  }
});
