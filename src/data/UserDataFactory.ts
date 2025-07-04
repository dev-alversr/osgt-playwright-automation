import { faker } from '@faker-js/faker';
import { Logger } from '../core/utils/LoggingUtils';
import { TestDataGenerationError } from '../core/utils/CustomErrors';

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

export class UserDataFactory {
  private logger: Logger;
  private departments = [
    'Finance', 'Accounting', 'Tax', 'Legal', 'HR', 'IT', 
    'Operations', 'Sales', 'Marketing', 'Compliance'
  ];
  private industries = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 
    'Retail', 'Education', 'Government', 'Non-profit'
  ];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  generateUser(overrides?: Partial<UserData>): UserData {
    try {
      const userData: UserData = {
        id: faker.string.uuid(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: this.generateSecurePassword(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        address: this.generateAddress(),
        role: faker.helpers.arrayElement(['admin', 'user', 'analyst', 'manager', 'viewer']),
        department: faker.helpers.arrayElement(this.departments),
        isActive: faker.datatype.boolean(),
        lastLoginDate: faker.date.recent({ days: 30 }),
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: faker.date.recent({ days: 7 }),
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
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to generate user data', { error: errorMessage });
      throw new TestDataGenerationError('User data generation failed', { error: errorMessage });
    }
  }

  generateUsers(count: number, overrides?: Partial<UserData>): UserData[] {
    try {
      const users: UserData[] = [];
      
      for (let i = 0; i < count; i++) {
        users.push(this.generateUser(overrides));
      }

      this.logger.info(`Generated ${count} user records`);
      return users;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to generate multiple users', { count, error: errorMessage });
      throw new TestDataGenerationError('Multiple user generation failed', { count, error: errorMessage });
    }
  }

  generateUserWithRole(role: 'admin' | 'user' | 'analyst' | 'manager' | 'viewer'): UserData {
    const rolePermissions = this.getPermissionsForRole(role);
    const roleDepartment = this.getDepartmentForRole(role);
    
    return this.generateUser({ 
      role, 
      isActive: true,
      permissions: rolePermissions,
      department: roleDepartment,
    });
  }

  generateAdmin(): UserData {
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

  generateTestUser(testIdentifier: string): UserData {
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

  generateBulkUsers(count: number, roleDistribution?: Record<string, number>): UserData[] {
    const users: UserData[] = [];
    const roles = Object.keys(roleDistribution || {}) as Array<'admin' | 'user' | 'analyst' | 'manager' | 'viewer'>;
    
    if (roleDistribution && roles.length > 0) {
      for (const role of roles) {
        const roleCount = roleDistribution[role];
        if (roleCount !== undefined) {
          for (let i = 0; i < roleCount; i++) {
            users.push(this.generateUserWithRole(role));
          }
        }
      }
    } else {
      for (let i = 0; i < count; i++) {
        users.push(this.generateUser());
      }
    }

    this.logger.info(`Generated ${count} bulk users`, { roleDistribution });
    return users;
  }

  generateCompany(overrides?: Partial<CompanyData>): CompanyData {
    try {
      const companyData: CompanyData = {
        id: faker.string.uuid(),
        name: faker.company.name(),
        industry: faker.helpers.arrayElement(this.industries),
        size: faker.helpers.arrayElement(['small', 'medium', 'large', 'enterprise']),
        address: this.generateAddress(),
        taxId: faker.string.alphanumeric(9).toUpperCase(),
        website: faker.internet.url(),
        phoneNumber: faker.phone.number(),
        isActive: faker.datatype.boolean(),
        createdAt: faker.date.past({ years: 5 }),
        ...overrides,
      };

      this.logger.debug('Generated company data', { 
        name: companyData.name, 
        industry: companyData.industry,
        size: companyData.size 
      });
      
      return companyData;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to generate company data', { error: errorMessage });
      throw new TestDataGenerationError('Company data generation failed', { error: errorMessage });
    }
  }

  generateCompanies(count: number, overrides?: Partial<CompanyData>): CompanyData[] {
    const companies: CompanyData[] = [];
    
    for (let i = 0; i < count; i++) {
      companies.push(this.generateCompany(overrides));
    }

    this.logger.info(`Generated ${count} company records`);
    return companies;
  }

  private generateAddress(): AddressData {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
    };
  }

  private generateSecurePassword(): string {
    return faker.internet.password({ length: 12, memorable: false });
  }

  private generateUserPreferences(): UserPreferences {
    return {
      theme: faker.helpers.arrayElement(['light', 'dark']),
      language: faker.helpers.arrayElement(['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES']),
      timezone: faker.location.timeZone(),
      dateFormat: faker.helpers.arrayElement(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
      currency: faker.finance.currencyCode(),
      notifications: {
        email: faker.datatype.boolean(),
        push: faker.datatype.boolean(),
        sms: faker.datatype.boolean(),
      },
    };
  }

  private generatePermissions(): string[] {
    const allPermissions = this.getAllPermissions();
    const permissionCount = faker.number.int({ min: 3, max: allPermissions.length });
    
    return faker.helpers.arrayElements(allPermissions, permissionCount);
  }

  private getAllPermissions(): string[] {
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

  private getPermissionsForRole(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
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

  private getDepartmentForRole(role: string): string {
    const roleDepartments: Record<string, string> = {
      admin: 'IT',
      manager: faker.helpers.arrayElement(['Finance', 'Accounting', 'Operations']),
      analyst: faker.helpers.arrayElement(['Finance', 'Accounting', 'Tax']),
      user: faker.helpers.arrayElement(this.departments),
      viewer: faker.helpers.arrayElement(this.departments),
    };

    return roleDepartments[role] || faker.helpers.arrayElement(this.departments);
  }

  generateLoginCredentials(role?: string): { username: string; password: string; email: string } {
    const user = role ? this.generateUserWithRole(role as any) : this.generateUser();
    
    return {
      username: user.username,
      password: user.password,
      email: user.email,
    };
  }

  generateUserForScenario(scenario: 'new_user' | 'inactive_user' | 'expired_user' | 'locked_user'): UserData {
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
          lastLoginDate: faker.date.past({ years: 1 }),
        };
      
      case 'expired_user':
        return {
          ...baseUser,
          isActive: true,
          lastLoginDate: faker.date.past({ years: 1 }),
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

  generateUserHierarchy(managerCount: number, usersPerManager: number): { managers: UserData[]; users: UserData[] } {
    const managers = this.generateBulkUsers(managerCount, { manager: managerCount });
    const users: UserData[] = [];

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