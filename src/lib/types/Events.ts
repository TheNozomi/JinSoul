import type { Piece } from '@sapphire/pieces';
import {
  type Message,
  Events as WAEvents
} from 'whatsapp-web.js';

import type { Args } from '../parsers/Args';
import type { Command } from '../structures/Command';
import type { Listener } from '../structures';

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

	CommandAccepted: 'commandAccepted' as const,
	CommandDenied: 'commandDenied' as const,
	CommandError: 'commandError' as const,
	CommandFinish: 'commandFinish' as const,
	CommandRun: 'commandRun' as const,
	CommandSuccess: 'commandSuccess' as const,
	CommandTypingError: 'commandTypingError' as const,
	ListenerError: 'listenerError' as const,
	NonPrefixedMessage: 'nonPrefixedMessage' as const,
	PiecePostLoad: 'piecePostLoad' as const,
	PieceUnload: 'pieceUnload' as const,
	PluginLoaded: 'pluginLoaded' as const,
	PreCommandRun: 'preCommandRun' as const,
	PrefixedMessage: 'prefixedMessage' as const,
	PreMessageParsed: 'preMessageParsed' as const,
	UnknownCommand: 'unknownCommand' as const,
	UnknownCommandName: 'unknownCommandName' as const
}

export interface IPieceError {
	piece: Piece;
}

export interface ListenerErrorPayload extends IPieceError {
	piece: Listener;
}

export interface UnknownCommandNamePayload {
	message: Message;
	prefix: string | RegExp;
	commandPrefix: string;
}

export interface UnknownCommandPayload extends UnknownCommandNamePayload {
	commandName: string;
}

export interface ICommandPayload {
	message: Message;
	command: Command;
}

export interface PreCommandRunPayload extends CommandDeniedPayload {}

export interface CommandDeniedPayload extends ICommandPayload {
	parameters: string;
	context: Command.RunContext;
}

export interface CommandAcceptedPayload extends ICommandPayload {
	parameters: string;
	context: Command.RunContext;
}

export interface CommandRunPayload<T extends Args = Args> extends CommandAcceptedPayload {
	args: T;
}

export interface CommandFinishPayload<T extends Args = Args> extends CommandRunPayload<T> {}

export interface CommandErrorPayload<T extends Args = Args> extends CommandRunPayload<T> {
	piece: Command;
}

export interface CommandSuccessPayload<T extends Args = Args> extends CommandRunPayload<T> {
	result: unknown;
}

export interface CommandTypingErrorPayload<T extends Args = Args> extends CommandRunPayload<T> {}
export interface ClientEvents {
  message_create: [message: Message];
  qr: [qr: string];
  ready: [];

  [K: string]: unknown[];
}
