## [Unreleased]
- Added: Description of a new feature.
- Fixed: Description of a bug fix.
- Changed: Description of a change in existing functionality.
- Removed: Description of deprecated features.

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
