import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GetFundsUseCase } from '../../../application/use-cases/funds/get-funds.use-case';
import { GetSubscriptionsUseCase } from '../../../application/use-cases/funds/get-subscriptions.use-case';
import { GetTransactionsUseCase } from '../../../application/use-cases/transactions/get-transactions.use-case';
import { GetCurrentUserUseCase } from '../../../application/use-cases/users/get-current-user.use-case';
import { Fund } from '../../../dominio/entities/fund.entity';
import { Transaction, TransactionType } from '../../../dominio/entities/transaction.entity';
import { User } from '../../../dominio/entities/user.entity';
import { PortfolioSubscription } from '../../../dominio/repositories/portfolio.repository';

type TransactionTypeFilter = 'ALL' | TransactionType;
type FundFilter = 'ALL' | number;

interface TransactionViewModel extends Transaction {
  fundName: string;
}

interface LabFiltersSnapshot {
  searchTerm: string;
  minAmount: number;
  selectedType: TransactionTypeFilter;
  selectedFundId: FundFilter;
  sortNewestFirst: boolean;
  showOnlyActiveFunds: boolean;
}

@Component({
  selector: 'app-signals-lab',
  imports: [CurrencyPipe, DatePipe, RouterLink, RouterLinkActive],
  templateUrl: './signals-lab.component.html',
  styleUrl: './signals-lab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalsLabComponent {
  private readonly getFundsUseCase = inject(GetFundsUseCase);
  private readonly getSubscriptionsUseCase = inject(GetSubscriptionsUseCase);
  private readonly getTransactionsUseCase = inject(GetTransactionsUseCase);
  private readonly getCurrentUserUseCase = inject(GetCurrentUserUseCase);

  // Signal que dispara una recarga manual de todos los recursos.
  private readonly reloadTick = signal(0);
  // Se usa para evitar persistir filtros en localStorage antes de hidratar el estado inicial.
  private readonly filtersHydrated = signal(false);
  private readonly storageKey = 'signals-lab-filters-v1';

  // Estado editable: filtros de la vista (Writable Signals).
  protected readonly searchTerm = signal('');
  protected readonly minAmount = signal(0);
  protected readonly selectedType = signal<TransactionTypeFilter>('ALL');
  protected readonly selectedFundId = signal<FundFilter>('ALL');
  protected readonly sortNewestFirst = signal(true);
  protected readonly showOnlyActiveFunds = signal(false);

  // Estado remoto con rxResource: cada recurso depende de reloadTick.
  private readonly fundsResource = rxResource({
    params: () => ({ reload: this.reloadTick() }),
    stream: () => this.getFundsUseCase.execute(),
    defaultValue: [] as Fund[],
  });

  private readonly userResource = rxResource({
    params: () => ({ reload: this.reloadTick() }),
    stream: () => this.getCurrentUserUseCase.execute(),
    defaultValue: { id: 1, balance: 0 } as User,
  });

  private readonly subscriptionsResource = rxResource({
    params: () => ({ reload: this.reloadTick() }),
    stream: () => this.getSubscriptionsUseCase.execute(),
    defaultValue: {} as Record<number, PortfolioSubscription>,
  });

  private readonly transactionsResource = rxResource({
    params: () => ({ reload: this.reloadTick() }),
    stream: () => this.getTransactionsUseCase.execute().pipe(map((items) => [...items])),
    defaultValue: [] as Transaction[],
  });

  // Exponemos recursos como signals de lectura para la plantilla.
  protected readonly funds = computed(() => this.fundsResource.value());
  protected readonly user = computed(() => this.userResource.value());
  protected readonly subscriptions = computed(() => this.subscriptionsResource.value());
  protected readonly transactions = computed(() => this.transactionsResource.value());

  protected readonly loading = computed(
    () =>
      this.fundsResource.isLoading() ||
      this.userResource.isLoading() ||
      this.subscriptionsResource.isLoading() ||
      this.transactionsResource.isLoading(),
  );

  protected readonly error = computed<string | null>(() => {
    if (this.fundsResource.error()) return 'No fue posible cargar los fondos.';
    if (this.userResource.error()) return 'No fue posible cargar el usuario.';
    if (this.subscriptionsResource.error()) return 'No fue posible cargar las suscripciones.';
    if (this.transactionsResource.error()) return 'No fue posible cargar las transacciones.';
    return null;
  });

  // Estado derivado con computed: map para resolver nombres y listas filtradas.
  protected readonly fundsById = computed(() => {
    const entries = this.funds().map((fund) => [fund.id, fund.name] as const);
    return new Map<number, string>(entries);
  });

  protected readonly activeFundIds = computed(() => {
    const ids = Object.keys(this.subscriptions()).map((key) => Number(key));
    return new Set(ids);
  });

  protected readonly fundFilterOptions = computed(() => {
    const activeIds = this.activeFundIds();
    return this.funds().map((fund) => ({
      id: fund.id,
      name: fund.name,
      isActive: activeIds.has(fund.id),
    }));
  });

  protected readonly enrichedTransactions = computed<TransactionViewModel[]>(() => {
    const namesById = this.fundsById();
    return this.transactions().map((transaction) => ({
      ...transaction,
      fundName: namesById.get(transaction.fundId) ?? `Fondo #${transaction.fundId}`,
    }));
  });

  protected readonly filteredTransactions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const minAmount = this.minAmount();
    const selectedType = this.selectedType();
    const selectedFundId = this.selectedFundId();
    const onlyActiveFunds = this.showOnlyActiveFunds();
    const activeIds = this.activeFundIds();

    let result = this.enrichedTransactions().filter((transaction) => {
      if (selectedType !== 'ALL' && transaction.type !== selectedType) {
        return false;
      }

      if (selectedFundId !== 'ALL' && transaction.fundId !== selectedFundId) {
        return false;
      }

      if (transaction.amount < minAmount) {
        return false;
      }

      if (onlyActiveFunds && !activeIds.has(transaction.fundId)) {
        return false;
      }

      if (term.length === 0) {
        return true;
      }

      return (
        transaction.fundName.toLowerCase().includes(term) ||
        transaction.notificationMethod.toLowerCase().includes(term) ||
        transaction.type.toLowerCase().includes(term)
      );
    });

    result = [...result].sort((a, b) => {
      const left = new Date(a.date).getTime();
      const right = new Date(b.date).getTime();
      return this.sortNewestFirst() ? right - left : left - right;
    });

    return result;
  });

  protected readonly subscribedCapital = computed(() => {
    return Object.values(this.subscriptions()).reduce((total, item) => total + item.amount, 0);
  });

  protected readonly remainingBalance = computed(() => this.user().balance);

  protected readonly averageTicket = computed(() => {
    const list = this.filteredTransactions();
    if (list.length === 0) {
      return 0;
    }

    const totalAmount = list.reduce((total, item) => total + item.amount, 0);
    return Math.round(totalAmount / list.length);
  });

  protected readonly subscribeCount = computed(() => {
    return this.filteredTransactions().filter((transaction) => transaction.type === 'SUBSCRIBE').length;
  });

  protected readonly cancelCount = computed(() => {
    return this.filteredTransactions().filter((transaction) => transaction.type === 'CANCEL').length;
  });

  protected readonly activeSubscriptionsCount = computed(() => Object.keys(this.subscriptions()).length);

  // Este effect persiste filtros: cada vez que cambie un filtro, se guarda el snapshot.
  private readonly persistFiltersEffect = effect(() => {
    if (!this.filtersHydrated()) {
      return;
    }

    const snapshot: LabFiltersSnapshot = {
      searchTerm: this.searchTerm(),
      minAmount: this.minAmount(),
      selectedType: this.selectedType(),
      selectedFundId: this.selectedFundId(),
      sortNewestFirst: this.sortNewestFirst(),
      showOnlyActiveFunds: this.showOnlyActiveFunds(),
    };

    this.saveFilters(snapshot);
  });

  // Effect didactico: trazamos en consola cambios de resultados filtrados.
  private readonly debugEffect = effect(() => {
    const visibleRows = this.filteredTransactions().length;

    untracked(() => {
      console.debug('[signals-lab] Filas visibles:', visibleRows);
    });
  });

  constructor() {
    this.hydrateFiltersFromStorage();
    this.filtersHydrated.set(true);
  }

  protected refreshData(): void {
    this.reloadTick.update((value) => value + 1);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.minAmount.set(0);
    this.selectedType.set('ALL');
    this.selectedFundId.set('ALL');
    this.sortNewestFirst.set(true);
    this.showOnlyActiveFunds.set(false);
  }

  protected onSearchTermChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value ?? '');
  }

  protected onMinAmountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const parsedValue = Number(input.value);
    this.minAmount.set(Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0);
  }

  protected onTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (value === 'SUBSCRIBE' || value === 'CANCEL') {
      this.selectedType.set(value);
      return;
    }

    this.selectedType.set('ALL');
  }

  protected onFundChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    if (select.value === 'ALL') {
      this.selectedFundId.set('ALL');
      return;
    }

    const parsedId = Number(select.value);
    this.selectedFundId.set(Number.isFinite(parsedId) ? parsedId : 'ALL');
  }

  protected onShowOnlyActiveFundsChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log('Show only active funds:', input.checked);
    this.showOnlyActiveFunds.set(input.checked);
  }

  protected onSortNewestFirstChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.sortNewestFirst.set(input.checked);
  }

  private hydrateFiltersFromStorage(): void {
    const snapshot = this.readFilters();
    if (!snapshot) {
      return;
    }

    this.searchTerm.set(snapshot.searchTerm);
    this.minAmount.set(snapshot.minAmount);
    this.selectedType.set(snapshot.selectedType);
    this.selectedFundId.set(snapshot.selectedFundId);
    this.sortNewestFirst.set(snapshot.sortNewestFirst);
    this.showOnlyActiveFunds.set(snapshot.showOnlyActiveFunds);
  }

  private readFilters(): LabFiltersSnapshot | null {
    if (!('localStorage' in globalThis)) {
      return null;
    }

    try {
      const raw = globalThis.localStorage.getItem(this.storageKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as Partial<LabFiltersSnapshot>;
      const selectedType = parsed.selectedType;
      const isValidType = selectedType === 'ALL' || selectedType === 'SUBSCRIBE' || selectedType === 'CANCEL';
      const selectedFundId = parsed.selectedFundId;
      const isValidFundFilter = selectedFundId === 'ALL' || typeof selectedFundId === 'number';

      if (!isValidType || !isValidFundFilter) {
        return null;
      }

      return {
        searchTerm: typeof parsed.searchTerm === 'string' ? parsed.searchTerm : '',
        minAmount: typeof parsed.minAmount === 'number' ? parsed.minAmount : 0,
        selectedType,
        selectedFundId,
        sortNewestFirst: typeof parsed.sortNewestFirst === 'boolean' ? parsed.sortNewestFirst : true,
        showOnlyActiveFunds:
          typeof parsed.showOnlyActiveFunds === 'boolean' ? parsed.showOnlyActiveFunds : false,
      };
    } catch {
      return null;
    }
  }

  private saveFilters(snapshot: LabFiltersSnapshot): void {
    if (!('localStorage' in globalThis)) {
      return;
    }

    try {
      globalThis.localStorage.setItem(this.storageKey, JSON.stringify(snapshot));
    } catch {
      // No-op: si localStorage no esta disponible, el laboratorio sigue funcionando.
    }
  }
}
