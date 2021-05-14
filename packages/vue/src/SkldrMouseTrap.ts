import MouseTrap from 'mousetrap';

export interface HotKey extends HotKeyMetaData {
  callback: (e: ExtendedKeyboardEvent, combo: String) => any;
}
export interface HotKeyMetaData {
  command: string;
  hotkey: string | string[];
}

// from https://github.com/ccampbell/mousetrap/tree/master/plugins/global-bind
(function (a) {
  var c = {},
    d = a.prototype.stopCallback;
  a.prototype.stopCallback = function (e, b, a, f) {
    return this.paused ? !0 : c[a] || c[f] ? !1 : d.call(this, e, b, a);
  };
  a.prototype.bindGlobal = function (a, b, d) {
    this.bind(a, b, d);
    if (a instanceof Array) for (b = 0; b < a.length; b++) c[a[b]] = !0;
    else c[a] = !0;
  };
  a.init();
})(Mousetrap);

export default class SkldrMouseTrap {
  private static _instance: SkldrMouseTrap;

  private mouseTrap: MousetrapInstance;
  private hotkeys: HotKey[];

  private constructor() {
    this.mouseTrap = new MouseTrap();
    this.hotkeys = [];
  }

  public static get commands(): HotKeyMetaData[] {
    return SkldrMouseTrap.instance().hotkeys.map((hk) => {
      return {
        command: hk.command,
        hotkey: hk.hotkey,
      };
    });
  }

  public static bind(hk: HotKey[]) {
    SkldrMouseTrap.reset();
    SkldrMouseTrap.instance().hotkeys = hk;

    hk.forEach((k) => {
      MouseTrap.bindGlobal(k.hotkey, k.callback);
      // SkldrMouseTrap.instance().mouseTrap.bindGlobal(k.hotkey, k.callback);
    });
  }

  public static reset() {
    MouseTrap.reset();
    SkldrMouseTrap.instance().mouseTrap.reset();
    SkldrMouseTrap.instance().hotkeys = [];
  }

  private static instance(): SkldrMouseTrap {
    if (SkldrMouseTrap._instance) {
      // MouseTrap.bind()
      return SkldrMouseTrap._instance;
    } else {
      SkldrMouseTrap._instance = new SkldrMouseTrap();
      return SkldrMouseTrap._instance;
    }
  }
}
