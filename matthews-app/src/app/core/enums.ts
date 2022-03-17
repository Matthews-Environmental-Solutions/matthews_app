export enum ContainerType {
    cardboard,
    fiberboard,
    hardwood,
    none,
  }

  export enum ContainerSize {
    child,
    standard,
    bariatric
  }

  export enum CaseStatuses {
    waitingForPermits,
    readyToCremate
  }

  export enum MachineStatus {
    shutdown = 0,
    preheat = 10,
    idle = 20,
    cremation = 30,
    rake = 40,
    cooldown = 50,
    curing = 60,
    emergencyBypass = 70
  }

  export enum ChamberStatus {
    valveCheck = 10,
    preheatActive = 20,
    preheatComplete = 30,
    awaitingCremationData = 40,
    awaitingStartConditions = 50,
    startConditionsMet = 60,
    loadDoorOpened = 70,
    cremationActive = 80,
    cremationPaused = 85,
    cremationTimeComplete = 90,
    cremationCompleted = 100,
    ashRakeInProgress = 110,
    awaitingDropInTemperature = 120,
    cooldownTimerStarted = 130,
    valveCheckFailure = 140,
    curingActive = 150,
    curingPaused = 160
  }

  export enum AshCoolingStatus {
  	rakeAshes = 10,
  	rakeDoorOpen = 20,
  	ashCoolingActive = 30,
  	asCoolingCompleted = 40,
  	dropAshes = 50
  }

  export enum AshRemovalStatus {
    ashesReadytoRemove = 10
  }

  export enum EmissionsStatus {
    bypass = 0,
    abatement = 10
  }
  // 10	Ashes Ready to Remove

  export enum BurnMode {
    Simplicity = 0,
    ECO = 1,
    Production = 2
  }
