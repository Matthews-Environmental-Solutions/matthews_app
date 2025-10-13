# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- New feature descriptions.
### Changed
- Changes made to existing features.
### Fixed
- Bug fixes...

## [2.37] - 2025-10-08
### Fixed
- In i4connected.service.ts, the getDevicesByFacility2 method is modified.

## [2.36] - 2025-09-23
### Fixed
- Filtering devices by type, so we have CREMATORS devices only.

## [2.35] - 2025-07-25
### Fixed
- Sorting unscheduled Cases by ClientCaseId.

## [2.34] - 2025-07-02
### Fixed
- In Day/Week calendar, the ActualStartTime will be taken in consideration, especialy when ScheduledStartTime is missing.

## [2.33] - 2025-06-27
### Fixed
- Case weight is added to Case tile in calendar
- Case Add/Edit form: Cremator label is changed to: Cremator ID

## [2.32] - 2025-05-26
### Fixed
- Message "No device found" is changed to be "Device has no alias" in case info dialog.
- Has new service: DemoService to provide information from CaseAPI about IsUseDemoEntitiesOnly

## [2.31] - 2025-05-12
### Fixed
- Improvement of getting the unscheduled Cases. We do filtering cases by facility. (not simply get all of them)

## [2.30] - 2025-04-23
### Fixed
- SignalR - once facility is changed it will unsubscribe to previous facility and subscribe to new one.

## [2.20] - 2025-04-07
### Fixed
- case-add-edit.component to trim text input fields. FirstName and LastName have limitation of 167 characters.
- CasesService: HttpErrorResponse is introduced in handleError

## [2.19] - 2025-03-18
### Fixed
- datetime pipe is changed to show date or time or both. In order to show date/time, the app is using this pipe only.

## [2.18] - 2025-03-14
### Added
- MqttMessageHandler is refactored. Translation for CYCLE_COMPLETE status is added.

## [2.17] - 2025-01-31
### Added
- Case Add/Edit - press Enter event is prevented

## [2.16] - 2024-12-19
### Added
- Weekly view and Daily view: text and background color to SELECTED status is added
- Changelog file is added (this file)
