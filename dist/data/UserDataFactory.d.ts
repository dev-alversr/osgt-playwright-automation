import { Logger } from '../core/utils/LoggingUtils';
export interface UserData {
    id?: string;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: AddressData;
    role: 'admin' | 'user' | 'analyst' | 'manager' | 'viewer';
    department: string;
    isActive: boolean;
    lastLoginDate?: Date;
    createdAt: Date;
    updatedAt?: Date;
    preferences: UserPreferences;
    permissions: string[];
}
export interface AddressData {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
export interface UserPreferences {
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
}
export interface CompanyData {
    id?: string;
    name: string;
    industry: string;
    size: 'small' | 'medium' | 'large' | 'enterprise';
    address: AddressData;
    taxId: string;
    website?: string;
    phoneNumber: string;
    isActive: boolean;
    createdAt: Date;
}
export declare class UserDataFactory {
    private logger;
    private departments;
    private industries;
    constructor(logger: Logger);
    generateUser(overrides?: Partial<UserData>): UserData;
    generateUsers(count: number, overrides?: Partial<UserData>): UserData[];
    generateUserWithRole(role: 'admin' | 'user' | 'analyst' | 'manager' | 'viewer'): UserData;
    generateAdmin(): UserData;
    generateTestUser(testIdentifier: string): UserData;
    generateBulkUsers(count: number, roleDistribution?: Record<string, number>): UserData[];
    generateCompany(overrides?: Partial<CompanyData>): CompanyData;
    generateCompanies(count: number, overrides?: Partial<CompanyData>): CompanyData[];
    private generateAddress;
    private generateSecurePassword;
    private generateUserPreferences;
    private generatePermissions;
    private getAllPermissions;
    private getPermissionsForRole;
    private getDepartmentForRole;
    generateLoginCredentials(role?: string): {
        username: string;
        password: string;
        email: string;
    };
    generateUserForScenario(scenario: 'new_user' | 'inactive_user' | 'expired_user' | 'locked_user'): UserData;
    generateUserHierarchy(managerCount: number, usersPerManager: number): {
        managers: UserData[];
        users: UserData[];
    };
}
