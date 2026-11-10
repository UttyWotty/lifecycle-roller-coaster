/**
 * The Non-stop choice, which makes Ride it and the ride video roll through every stop without pausing.
 * It starts off and is remembered on this device, and every part of the page reading it sees the same value.
 * The storage rules live in deviceChoice; this file only names the choice.
 */
"use client";

import { createDeviceChoice, type DeviceChoiceState } from "./deviceChoice";

const nonStop = createDeviceChoice("lifecycle-roller-coaster:non-stop");

export type NonStop = DeviceChoiceState;

/** Whether Non-stop is on, for the video recorder, which reads it when a recording starts. */
export const isNonStopOn = nonStop.isOn;

export const useNonStop = nonStop.useChoice;
