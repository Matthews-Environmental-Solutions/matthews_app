export class Facility {
    icon!: string;
    name!: string;
    id!: string; //GUID
    isValid!: boolean;
    errorMessage!: string;
    errors: string[] = [];
}