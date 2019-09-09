import {Injectable, NgZone} from '@angular/core';

import * as Mousetrap from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';
import {NavigationService} from '../navigation';

@Injectable({
  providedIn: 'root'
})
export class Hotkey {
  isHotkeyTimer: number;

  constructor(private navigationService: NavigationService,
              private zone: NgZone) {
    Mousetrap.prototype.stopCallback = function (e, element, combo) {
      return false;
    };

    // enable hot key mode
    Mousetrap.bind('ctrl+/', (e) => {
      e.preventDefault();
      this.disableHotKeyMode();
      this.isHotkeyTimer = setTimeout(() => {
        this.disableHotKeyMode();
      }, 500);
    });

    const globalHotKeys = [
      {
        keys: 'o',
        callback: () => {
          this.navigationService.toSearch();
        }
      },
      {
        keys: 's',
        callback: () => {
          this.navigationService.toSettings();
        }
      }
    ];

    globalHotKeys.forEach((config) => {
      this.registerHotkey(config.keys, config.callback);
    });

    /*
    *
    * Sync databases.
    * Open search page.
    * Open dialog - search page.
    * Open dialog - latest edited pages.
    * Open command palette.
    *
    * */
  }

  registerHotkey(keys: string, callback) {
    Mousetrap.bind(keys, (e) => {
      if (this.isHotkeyTimer) {
        e.preventDefault();

        this.zone.run(() => {
          callback();
        });

        this.disableHotKeyMode();
      }
    });
  }

  private disableHotKeyMode() {
    if (this.isHotkeyTimer) {
      console.log(`disableHotKeyMode`);
      clearTimeout(this.isHotkeyTimer);
      this.isHotkeyTimer = null;
    }
  }
}
