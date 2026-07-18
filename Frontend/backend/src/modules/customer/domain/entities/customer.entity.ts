export class CustomerEntity {
  constructor(
    public readonly id: string,
    public code: string,
    public nameAr: string,
    public nameEn: string | null,
    public phone: string,
    public email: string | null,
    public type: string,
    public status: string,
    public balance: number,
    public address: string | null,
    public projectId: string,
    public unitId: string | null,
    public readonly createdAt: Date,
  ) {}

  activate() { this.status = "active"; }
  suspend() { this.status = "suspended"; }
  archive() { this.status = "archived"; }

  addToBalance(amount: number) { this.balance += amount; }

  canDelete(): boolean {
    return this.status === "archived" || this.balance === 0;
  }
}
