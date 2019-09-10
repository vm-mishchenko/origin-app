import {Injectable, NgZone} from '@angular/core';

import * as Mousetrap from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';
import {RecentlyViewedPagesService} from '../../features/page/recently-viewed/recently-viewed.service';
import {NavigationService} from '../navigation';
import {StorageSyncService} from '../storage/storage-sync.service';

const HOTKEY_MODE_LIVE_TIME = 500;

@Injectable({
  providedIn: 'root'
})
export class Hotkey {
  // setTimeout timer - while exist allow to run hotkey
  isHotkeyTimer: number;

  constructor(private navigationService: NavigationService,
              private storageSyncService: StorageSyncService,
              private recentlyViewedPagesService: RecentlyViewedPagesService,
              private zone: NgZone) {
    // allow shortcut when focus inside input elements
    Mousetrap.prototype.stopCallback = function (e, element, combo) {
      return false;
    };

    // enable hot key mode
    Mousetrap.bind('ctrl+/', (e) => {
      e.preventDefault();
      this.enableHotKeyMode();
    });

    const globalHotKeys = [
      {
        keys: ['o', 'ctrl+o'],
        callback: () => {
          this.navigationService.toSearch();
        }
      },

      // sync with remote database
      {
        keys: ['s', 'ctrl+s'],
        callback: () => {
          this.storageSyncService.sync();
        }
      },
      {
        keys: ['[', 'ctrl+['],
        callback: () => {
          this.recentlyViewedPagesService.goToPreviousPage();
        }
      },
      {
        keys: [']', 'ctrl+]'],
        callback: () => {
          this.recentlyViewedPagesService.goToNextPage();
        }
      }
    ];

    globalHotKeys.forEach((config) => {
      this.registerHotkey(config.keys, config.callback);
    });
  }

  registerHotkey(keys: string | string[], callback) {
    return Mousetrap.bind(keys, (e) => {
      if (this.isHotkeyTimer) {
        e.preventDefault();

        this.zone.run(() => {
          callback();
        });

        this.disableHotKeyMode();
      }
    });
  }

  private enableHotKeyMode() {
    this.disableHotKeyMode();

    this.isHotkeyTimer = setTimeout(() => {
      this.disableHotKeyMode();
    }, HOTKEY_MODE_LIVE_TIME);
  }

  private disableHotKeyMode() {
    if (this.isHotkeyTimer) {
      clearTimeout(this.isHotkeyTimer);
      this.isHotkeyTimer = null;
    }
  }
}
