namespace MatthewsApp.API.Enums;

public enum CaseStatus

{
    UNSCHEDULED,
    CREMATION_COMPLETE, // green
    IN_PROGRESS, // red
    READY_TO_CREMATE, // orange
    WAITING_FOR_PERMIT, // black
    SELECTED // blue
}
