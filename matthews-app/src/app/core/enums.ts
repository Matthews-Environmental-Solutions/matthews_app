/* eslint-disable @typescript-eslint/naming-convention */
export enum ContainerType {
  NONE,
  CARDBOARD,
  HARDWOOD,
  MDF_PARTICLE_BOARD,
  BAG_SHROUD,
  OTHER,
}

export enum ContainerSize {
  NONE,
  INFANT,
  STANDARD,
  BARIATRIC,
}

export enum GenderType {
  OTHER,
  MALE,
  FEMALE,
}

export enum CaseStatuses {
  UNSCHEDULED,
  CREMATION_COMPLETE,
  IN_PROGRESS,
  READY_TO_CREMATE,
  WAITING_FOR_PERMIT,
}

export enum MachineStatus {
  shutDownMode = 0,
  openValveCheck = 10,
  closeValveCheck = 20,
  preheatActive = 30,
  idleMode = 40,
  awaitingStartConditions = 50,
  startConditionsMet = 60,
  loadDoorOpen = 70,
  loadDoorClose = 80,
  cremationActive = 90,
  cremationCompleted = 100,
  awaitingDropInTemperature = 110,
  rakeAshes = 120,
  ashRakeInProgress = 130,
  cooldownTimerStarted = 140,
  resetDevices = 150,
  curingActive = 160,
  curingPaused = 183,
}

export enum ChamberStatus {
  shutDownMode = 0,
  openValveCheck = 10,
  closeValveCheck = 20,
  preheatActive = 30,
  idleMode = 40,
  awaitingStartConditions = 50,
  startConditionsMet = 60,
  loadDoorOpen = 70,
  loadDoorClose = 80,
  cremationActive = 90,
  cremationCompleted = 100,
  awaitingDropInTemperature = 110,
  rakeAshes = 120,
  ashRakeInProgress = 130,
  cooldownTimerStarted = 140,
  resetDevices = 150,
  curingActive = 160,
  curingPaused = 183,
}

export enum AshCoolingStatus {
  rakeAshes = 10,
  rakeDoorOpen = 20,
  ashCoolingActive = 30,
  asCoolingCompleted = 40,
  dropAshes = 50,
}

export enum AshRemovalStatus {
  ashesReadytoRemove = 10,
}

export enum EmissionsStatus {
  bypass = 0,
  abatement = 10,
}
// 10	Ashes Ready to Remove

export enum BurnMode {
  Simplicity = 0,
  ECO = 1,
  Production = 2,
}
