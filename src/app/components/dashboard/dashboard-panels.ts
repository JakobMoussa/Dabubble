/** Open and closed state of the dashboard panels, popups and sidebar lists. */
export abstract class DashboardPanels {
  isSidebarHidden = false;
  isSettingsPopupOpen = false;
  isChannelPopupOpen = false;
  isProfilePopupOpen = false;
  isChannelsOpen = true;
  isDirectMessagesOpen = true;
  isChannelSettingsOpen = false;
  membersDialogMode: 'list' | 'add' | null = null;


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
}
