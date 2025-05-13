## [Unreleased]
- Added: Description of a new feature.
- Fixed: Description of a bug fix.
- Changed: Description of a change in existing functionality.
- Removed: Description of deprecated features.

## [1.1.1] - 2025-05-12
	- Fixed:
	    Improvement of getting the unscheduled Cases. We do filtering cases by facility. (not simply get all of them)

## [1.1.0] - 2025-05-06
	- Added:
		DemoSeedCasesService is added. It reads CSV file with Cases data and update database.
	- Fixed:
		"Matthews Demo Sample Cases v4.csv" is added to the project. It contains 150 Cases. The CSV file is encoded to UTF-8. Empty lines are removed. The first line is a header. The file is used for demo purposes only. In numbers, decimal delimiter is dot.

## [1.0.7] - 2025-04-23
	- Fixed:
		CasesService.SeedDbForDemo is fixed. Two unscheduled cases are added. ScheduledDeviceAlias is populated from DB.

## [1.0.6] - 2025-04-07
	- Fixed:
		CaseI4cHttpClientService to prevent Case API IIS pool to break down when the i4connected is not working.
		CasesService is handing exceptions on Create.

## [1.0.5] - 2025-03-13
	- Fixed:
		MqttMessageHandler has better handling of incoming messages. It will trust to Flexy messages. Code is refactored.

## [1.0.4] - 2025-02-25
	- Fixed:
		When get NEXT Case for device, the Case will be set to SELECTED status.

## [1.0.3] - 2025-01-31
	- Fixed:
		When CaseDeselect arrive from Flexy, the Flexy will not be notified about deselection.

## [1.0.2] - 2025-01-17
	- Added:
		MqttMessageHandler is a service that handles incoming MQTT messages. It will cover all incoming messages and will call the appropriate service to handle the message.

## [1.0.1] - 2024-12-18
	- CaseService on "CaseSelect" MQTT, will deselect all selected Cases first and then select the new Case.

## [1.0.0] - 2024-12-13
	- Author: Branislav Kurbalija
	- Service: FacilityStatusChecker is a service that checks the status of a facility and create missing FacilityStatus records.
