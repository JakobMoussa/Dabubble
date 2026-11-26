import { AfterViewInit, Directive } from '@angular/core';
import { focusWhenReady } from '../../shared/focus-when-ready';
import { MentionTarget } from '../../shared/mention-parts';

/** Open and closed state of the dashboard panels, popups and sidebar lists, plus mention navigation. */
@Directive()
export abstract class DashboardPanels implements AfterViewInit {
  isSidebarHidden = false;
  isSettingsPopupOpen = false;
  isChannelPopupOpen = false;
  isProfilePopupOpen = false;
  isChannelsOpen = true;
  isDirectMessagesOpen = true;
  isChannelSettingsOpen = false;
  membersDialogMode: 'list' | 'add' | null = null;
  mobileView: 'menu' | 'chat' | 'thread' = 'menu';

  abstract selectChannel(channelId: string): void;
  abstract selectMember(memberId: string): Promise<void>;


  /** Focuses the message input after every login, also when a conversation is still open from before. */
  ngAfterViewInit(): void {
    focusWhenReady('chat-message-input');
  }


  /** Opens the members dialog in add or list mode. */
  openMembers(addMode: boolean): void {
    this.membersDialogMode = addMode ? 'add' : 'list';
  }


  /** Shows or hides the sidebar. */
  toggleSidebar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
  }


  /** Opens the add-channel popup. */
  openChannelPopup(): void {
    this.isChannelPopupOpen = true;
  }


  /** Closes the add-channel popup. */
  closeChannelPopup(): void {
    this.isChannelPopupOpen = false;
  }


  /** Opens the settings popup. */
  openSettingsPopup(): void {
    this.isSettingsPopupOpen = true;
  }


  /** Closes the settings popup. */
  closeSettingsPopup(): void {
    this.isSettingsPopupOpen = false;
  }


  /** Expands or collapses the channel list. */
  toggleChannels(): void {
    this.isChannelsOpen = !this.isChannelsOpen;
  }


  /** Expands or collapses the direct message list. */
  toggleDirectMessages(): void {
    this.isDirectMessagesOpen = !this.isDirectMessagesOpen;
  }


  /** Switches the mobile view to the menu. */
  openMobileMenu(): void {
    this.mobileView = 'menu';
  }


  /** Opens the direct chat or channel behind a clicked mention. */
  openMention(target: MentionTarget): void {
    if (target.kind === 'channel') {
      this.selectChannel(target.id);
    } else {
      this.selectMember(target.id);
    }
  }
}
