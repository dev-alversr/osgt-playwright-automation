"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataFactory = void 0;
const faker_1 = require("@faker-js/faker");
const CustomErrors_1 = require("../core/utils/CustomErrors");
class UserDataFactory {
    logger;
    departments = [
        'Finance', 'Accounting', 'Tax', 'Legal', 'HR', 'IT',
        'Operations', 'Sales', 'Marketing', 'Compliance'
    ];
    industries = [
        'Technology', 'Healthcare', 'Finance', 'Manufacturing',
        'Retail', 'Education', 'Government', 'Non-profit'
    ];
    constructor(logger) {
        this.logger = logger;
    }
    generateUser(overrides) {
        try {
            const userData = {
                id: faker_1.faker.string.uuid(),
                username: faker_1.faker.internet.userName(),
                email: faker_1.faker.internet.email(),
                password: this.generateSecurePassword(),
                firstName: faker_1.faker.person.firstName(),
                lastName: faker_1.faker.person.lastName(),
                phone: faker_1.faker.phone.number(),
                address: this.generateAddress(),
                role: faker_1.faker.helpers.arrayElement(['admin', 'user', 'analyst', 'manager', 'viewer']),
                department: faker_1.faker.helpers.arrayElement(this.departments),
                isActive: faker_1.faker.datatype.boolean(),
                lastLoginDate: faker_1.faker.date.recent({ days: 30 }),
                createdAt: faker_1.faker.date.past({ years: 2 }),
                updatedAt: faker_1.faker.date.recent({ days: 7 }),
                preferences: this.generateUserPreferences(),
                permissions: this.generatePermissions(),
                ...overrides,
            };
            this.logger.debug('Generated user data', {
                username: userData.username,
                role: userData.role,
                department: userData.department
            });
            return userData;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to generate user data', { error: errorMessage });
            throw new CustomErrors_1.TestDataGenerationError('User data generation failed', { error: errorMessage });
        }
    }
    generateUsers(count, overrides) {
        try {
            const users = [];
            for (let i = 0; i < count; i++) {
                users.push(this.generateUser(overrides));
            }
            this.logger.info(`Generated ${count} user records`);
            return users;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to generate multiple users', { count, error: errorMessage });
            throw new CustomErrors_1.TestDataGenerationError('Multiple user generation failed', { count, error: errorMessage });
        }
    }
    generateUserWithRole(role) {
        const rolePermissions = this.getPermissionsForRole(role);
        const roleDepartment = this.getDepartmentForRole(role);
        return this.generateUser({
            role,
            isActive: true,
            permissions: rolePermissions,
            department: roleDepartment,
        });
    }
    generateAdmin() {
        return this.generateUser({
            role: 'admin',
            isActive: true,
            email: 'admin@onesource.com',
            username: 'admin',
            firstName: 'System',
            lastName: 'Administrator',
            department: 'IT',
            permissions: this.getAllPermissions(),
        });
    }
    generateTestUser(testIdentifier) {
        return this.generateUser({
            username: `test_${testIdentifier}_${Date.now()}`,
            email: `test.${testIdentifier}@example.com`,
            firstName: 'Test',
            lastName: `User_${testIdentifier}`,
            role: 'user',
            isActive: true,
            department: 'Finance',
        });
    }
    generateBulkUsers(count, roleDistribution) {
        const users = [];
        const roles = Object.keys(roleDistribution || {});
        if (roleDistribution && roles.length > 0) {
            for (const role of roles) {
                const roleCount = roleDistribution[role];
                if (roleCount !== undefined) {
                    for (let i = 0; i < roleCount; i++) {
                        users.push(this.generateUserWithRole(role));
                    }
                }
            }
        }
        else {
            for (let i = 0; i < count; i++) {
                users.push(this.generateUser());
            }
        }
        this.logger.info(`Generated ${count} bulk users`, { roleDistribution });
        return users;
    }
    generateCompany(overrides) {
        try {
            const companyData = {
                id: faker_1.faker.string.uuid(),
                name: faker_1.faker.company.name(),
                industry: faker_1.faker.helpers.arrayElement(this.industries),
                size: faker_1.faker.helpers.arrayElement(['small', 'medium', 'large', 'enterprise']),
                address: this.generateAddress(),
                taxId: faker_1.faker.string.alphanumeric(9).toUpperCase(),
                website: faker_1.faker.internet.url(),
                phoneNumber: faker_1.faker.phone.number(),
                isActive: faker_1.faker.datatype.boolean(),
                createdAt: faker_1.faker.date.past({ years: 5 }),
                ...overrides,
            };
            this.logger.debug('Generated company data', {
                name: companyData.name,
                industry: companyData.industry,
                size: companyData.size
            });
            return companyData;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to generate company data', { error: errorMessage });
            throw new CustomErrors_1.TestDataGenerationError('Company data generation failed', { error: errorMessage });
        }
    }
    generateCompanies(count, overrides) {
        const companies = [];
        for (let i = 0; i < count; i++) {
            companies.push(this.generateCompany(overrides));
        }
        this.logger.info(`Generated ${count} company records`);
        return companies;
    }
    generateAddress() {
        return {
            street: faker_1.faker.location.streetAddress(),
            city: faker_1.faker.location.city(),
            state: faker_1.faker.location.state(),
            zipCode: faker_1.faker.location.zipCode(),
            country: faker_1.faker.location.country(),
        };
    }
    generateSecurePassword() {
        return faker_1.faker.internet.password({ length: 12, memorable: false });
    }
    generateUserPreferences() {
        return {
            theme: faker_1.faker.helpers.arrayElement(['light', 'dark']),
            language: faker_1.faker.helpers.arrayElement(['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES']),
            timezone: faker_1.faker.location.timeZone(),
            dateFormat: faker_1.faker.helpers.arrayElement(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
            currency: faker_1.faker.finance.currencyCode(),
            notifications: {
                email: faker_1.faker.datatype.boolean(),
                push: faker_1.faker.datatype.boolean(),
                sms: faker_1.faker.datatype.boolean(),
            },
        };
    }
    generatePermissions() {
        const allPermissions = this.getAllPermissions();
        const permissionCount = faker_1.faker.number.int({ min: 3, max: allPermissions.length });
        return faker_1.faker.helpers.arrayElements(allPermissions, permissionCount);
    }
    getAllPermissions() {
        return [
            'read_dashboard',
            'write_dashboard',
            'read_analytics',
            'write_analytics',
            'read_reports',
            'write_reports',
            'read_users',
            'write_users',
            'read_companies',
            'write_companies',
            'admin_access',
            'delete_data',
            'export_data',
            'import_data',
            'manage_settings',
            'view_audit_logs',
            'manage_permissions',
        ];
    }
    getPermissionsForRole(role) {
        const rolePermissions = {
            admin: this.getAllPermissions(),
            manager: [
                'read_dashboard', 'write_dashboard', 'read_analytics', 'write_analytics',
                'read_reports', 'write_reports', 'read_users', 'export_data', 'view_audit_logs'
            ],
            analyst: [
                'read_dashboard', 'read_analytics', 'write_analytics', 'read_reports',
                'write_reports', 'export_data'
            ],
            user: [
                'read_dashboard', 'read_analytics', 'read_reports'
            ],
            viewer: [
                'read_dashboard', 'read_reports'
            ],
        };
        return rolePermissions[role] || rolePermissions.user || [];
    }
    getDepartmentForRole(role) {
        const roleDepartments = {
            admin: 'IT',
            manager: faker_1.faker.helpers.arrayElement(['Finance', 'Accounting', 'Operations']),
            analyst: faker_1.faker.helpers.arrayElement(['Finance', 'Accounting', 'Tax']),
            user: faker_1.faker.helpers.arrayElement(this.departments),
            viewer: faker_1.faker.helpers.arrayElement(this.departments),
        };
        return roleDepartments[role] || faker_1.faker.helpers.arrayElement(this.departments);
    }
    generateLoginCredentials(role) {
        const user = role ? this.generateUserWithRole(role) : this.generateUser();
        return {
            username: user.username,
            password: user.password,
            email: user.email,
        };
    }
    generateUserForScenario(scenario) {
        const baseUser = this.generateUser();
        switch (scenario) {
            case 'new_user':
                return {
                    ...baseUser,
                    createdAt: new Date(),
                    lastLoginDate: undefined,
                    isActive: true,
                };
            case 'inactive_user':
                return {
                    ...baseUser,
                    isActive: false,
                    lastLoginDate: faker_1.faker.date.past({ years: 1 }),
                };
            case 'expired_user':
                return {
                    ...baseUser,
                    isActive: true,
                    lastLoginDate: faker_1.faker.date.past({ years: 1 }),
                };
            case 'locked_user':
                return {
                    ...baseUser,
                    isActive: false,
                };
            default:
                return baseUser;
        }
    }
    generateUserHierarchy(managerCount, usersPerManager) {
        const managers = this.generateBulkUsers(managerCount, { manager: managerCount });
        const users = [];
        for (const manager of managers) {
            for (let i = 0; i < usersPerManager; i++) {
                const user = this.generateUser({
                    department: manager.department,
                });
                users.push(user);
            }
        }
        this.logger.info('Generated user hierarchy', {
            managerCount,
            usersPerManager,
            totalUsers: users.length
        });
        return { managers, users };
    }
}
exports.UserDataFactory = UserDataFactory;
