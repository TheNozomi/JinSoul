import {
  type Message,
  Events as WAEvents
} from 'whatsapp-web.js';

export const Events = {
  Authenticated: WAEvents.AUTHENTICATED,
  AuthenticationFailure: WAEvents.AUTHENTICATION_FAILURE,
  BatteryChanged: WAEvents.BATTERY_CHANGED,
  Disconnected: WAEvents.DISCONNECTED,
  GroupJoin: WAEvents.GROUP_JOIN,
  GroupLeave: WAEvents.GROUP_LEAVE,
  GroupUpdate: WAEvents.GROUP_UPDATE,
  MediaUploaded: WAEvents.MEDIA_UPLOADED,
  MessageAck: WAEvents.MESSAGE_ACK,
  MessageCreate: WAEvents.MESSAGE_CREATE,
  MessageDelete: WAEvents.MESSAGE_REVOKED_EVERYONE,
  MessageReceived: WAEvents.MESSAGE_RECEIVED,
  QR: WAEvents.QR_RECEIVED,
  Ready: WAEvents.READY,
  StateChanged: WAEvents.STATE_CHANGED,

  // Message commands chain
  PreMessageParsed: 'preMessageParsed' as const,
  MentionPrefixOnly: 'mentionPrefixOnly' as const,
  NonPrefixedMessage: 'nonPrefixedMessage' as const,
  PrefixedMessage: 'prefixedMessage' as const,

  UnknownMessageCommandName: 'unknownMessageCommandName' as const,
  UnknownMessageCommand: 'unknownMessageCommand' as const,
  CommandDoesNotHaveMessageCommandHandler: 'commandDoesNotHaveMessageCommandHandler' as const,
  PreMessageCommandRun: 'preMessageCommandRun' as const,

  MessageCommandDenied: 'messageCommandDenied' as const,
  MessageCommandAccepted: 'messageCommandAccepted' as const,

  MessageCommandRun: 'messageCommandRun' as const,
  MessageCommandSuccess: 'messageCommandSuccess' as const,
  MessageCommandError: 'messageCommandError' as const,
  MessageCommandFinish: 'messageCommandFinish' as const,

  MessageCommandTypingError: 'messageCommandTypingError' as const,

  // Listener errors
  ListenerError: 'listenerError' as const,

  // Registry errors
  CommandApplicationCommandRegistryError: 'commandApplicationCommandRegistryError' as const,

  // Piece store?
  PiecePostLoad: 'piecePostLoad' as const,
  PieceUnload: 'pieceUnload' as const,

  // Plugin
  PluginLoaded: 'pluginLoaded' as const
}

export interface ClientEvents {
  message_create: [message: Message];
  qr: [qr: string];
  ready: [];

  [K: string]: unknown[];
}
