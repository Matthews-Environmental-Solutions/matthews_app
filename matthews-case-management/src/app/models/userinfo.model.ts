export class UserInfo {
    name!: string;
    given_name: string | undefined;
    family_name: string | undefined;

    copyInto(jsonData: any) {
        this.name = jsonData.name;
        this.given_name = jsonData.given_name;
        this.family_name = jsonData.family_name;
    }
}