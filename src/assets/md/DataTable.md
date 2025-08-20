Awesome—let’s wire up a clean, Bootstrap-styled Angular data table that reads your JSON from `assets/` and supports search, sorting, pagination, and an optional CSV export.

---

# 1) Put your JSON in `assets/mutualfunds.json`

```json
[
  {
    "mfId": "M_PARO",
    "slug": "/mutualfunds/parag-parikh-flexi-cap-fund-M_PARO",
    "name": "Parag Parikh Flexi Cap Fund",
    "values": [
      { "filter": "subsector", "strVal": "Flexi Cap Fund" },
      { "filter": "option", "strVal": "Growth" },
      { "filter": "aum", "doubleVal": 113280.87150000001 },
      { "filter": "expRatio", "doubleVal": 0.63 },
      { "filter": "ret1y", "doubleVal": 11.127483641191793 }
    ],
    "sector": "Equity"
  },
  {
    "mfId": "M_HDCBA",
    "slug": "/mutualfunds/hdfc-balanced-advantage-fund-M_HDCBA",
    "name": "HDFC Balanced Advantage Fund",
    "values": [
      { "filter": "expRatio", "doubleVal": 0.75 },
      { "filter": "ret3y", "doubleVal": 3.0446274176202897 },
      { "filter": "subsector", "strVal": "Balanced Advantage Fund" },
      { "filter": "option", "strVal": "Growth" },
      { "filter": "aum", "doubleVal": 101772.601 }
    ],
    "sector": "Hybrid"
  },
  {
    "mfId": "M_HDCMS",
    "slug": "/mutualfunds/hdfc-mid-cap-fund-M_HDCMS",
    "name": "HDFC Mid Cap Fund",
    "values": [
      { "filter": "expRatio", "doubleVal": 0.75 },
      { "filter": "ret5y", "doubleVal": 30.494097725043833 },
      { "filter": "subsector", "strVal": "Mid Cap Fund" },
      { "filter": "option", "strVal": "Growth" },
      { "filter": "aum", "doubleVal": 83847.3855 }
    ],
    "sector": "Equity"
  }
]
```

---

# 2) Create a model (interfaces)

`src/app/models/mf.model.ts`

```ts
export interface MFValue {
  filter: string;
  strVal?: string | null;
  doubleVal?: number | null;
}

export interface MutualFundRaw {
  mfId: string;
  slug: string;
  name: string;
  values: MFValue[];
  sector: string;
}

export interface MutualFund {
  mfId: string;
  name: string;
  sector: string;
  subsector?: string;
  option?: string;
  aum?: number;       // in ₹ crores (as given)
  expRatio?: number;  // in %
  ret1y?: number;     // in %
  ret3y?: number;     // in %
  ret5y?: number;     // in %
  slug: string;
}
```

---

# 3) Service to load + flatten the JSON

`src/app/services/mf.service.ts`

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { MutualFundRaw, MutualFund } from '../models/mf.model';

@Injectable({ providedIn: 'root' })
export class MfService {
  private url = 'assets/mutualfunds.json';

  constructor(private http: HttpClient) {}

  getFunds(): Observable<MutualFund[]> {
    return this.http.get<MutualFundRaw[]>(this.url).pipe(
      map(rows => rows.map(r => this.flatten(r)))
    );
  }

  private flatten(r: MutualFundRaw): MutualFund {
    const pickStr = (key: string) => r.values.find(v => v.filter === key)?.strVal ?? undefined;
    const pickNum = (key: string) => r.values.find(v => v.filter === key)?.doubleVal ?? undefined;

    return {
      mfId: r.mfId,
      name: r.name,
      sector: r.sector,
      subsector: pickStr('subsector'),
      option: pickStr('option'),
      aum: pickNum('aum'),
      expRatio: pickNum('expRatio'),
      ret1y: pickNum('ret1y'),
      ret3y: pickNum('ret3y'),
      ret5y: pickNum('ret5y'),
      slug: r.slug
    };
  }
}
```

---

# 4) Data table component

## a) Component TS

`src/app/components/mf-table/mf-table.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { MfService } from '../../services/mf.service';
import { MutualFund } from '../../models/mf.model';

type SortKey = keyof MutualFund | '';

@Component({
  selector: 'app-mf-table',
  templateUrl: './mf-table.component.html',
  styleUrls: ['./mf-table.component.css']
})
export class MfTableComponent implements OnInit {
  all: MutualFund[] = [];
  filtered: MutualFund[] = [];

  // UI state
  searchText = '';
  sortKey: SortKey = '';
  sortDir: 'asc' | 'desc' = 'asc';
  page = 1;
  pageSize = 10;

  // for page counters
  get total() { return this.filtered.length; }
  get pageCount() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  constructor(private mfService: MfService) {}

  ngOnInit() {
    this.mfService.getFunds().subscribe(data => {
      this.all = data;
      this.applyAll();
    });
  }

  onSearch(text: string) {
    this.searchText = text;
    this.page = 1;
    this.applyAll();
  }

  setSort(key: SortKey) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.applyAll();
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.page = 1;
    this.applyAll();
  }

  goToPage(newPage: number) {
    this.page = Math.min(Math.max(1, newPage), this.pageCount);
    this.applyAll(false); // don't re-filter/sort, just recompute slice
  }

  exportCsv() {
    const header = ['MF ID','Name','Sector','Subsector','Option','AUM','Expense Ratio (%)','1Y (%)','3Y (%)','5Y (%)','Slug'];
    const rows = this.filtered.map(r => [
      r.mfId, r.name, r.sector, r.subsector ?? '', r.option ?? '',
      r.aum ?? '', r.expRatio ?? '', r.ret1y ?? '', r.ret3y ?? '', r.ret5y ?? '', r.slug
    ]);

    const csv = [header, ...rows].map(row =>
      row.map(v => typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g,'""')}"` : v).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mutual_funds.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ---------- helpers ----------
  private applyAll(recompute = true) {
    if (recompute) {
      // filter
      const q = this.searchText.trim().toLowerCase();
      const filtered = !q ? this.all : this.all.filter(r => {
        return [
          r.mfId, r.name, r.sector, r.subsector, r.option, r.slug,
          r.aum?.toString(), r.expRatio?.toString(), r.ret1y?.toString(), r.ret3y?.toString(), r.ret5y?.toString()
        ].some(val => (val ?? '').toString().toLowerCase().includes(q));
      });

      // sort
      const sorted = this.sortKey ? [...filtered].sort((a, b) => {
        const av = a[this.sortKey];
        const bv = b[this.sortKey];
        if (av == null && bv == null) return 0;
        if (av == null) return this.sortDir === 'asc' ? -1 : 1;
        if (bv == null) return this.sortDir === 'asc' ? 1 : -1;
        if (typeof av === 'number' && typeof bv === 'number') {
          return this.sortDir === 'asc' ? av - bv : bv - av;
        }
        return this.sortDir === 'asc'
          ? av.toString().localeCompare(bv.toString())
          : bv.toString().localeCompare(av.toString());
      }) : filtered;

      this.filtered = sorted;
    }

    // paginate (client-side)
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    // slice is applied directly in template with | slice, so nothing else needed here.
  }

  sortIcon(key: SortKey) {
    if (this.sortKey !== key) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }
}
```

## b) Component HTML

`src/app/components/mf-table/mf-table.component.html`

```html
<div class="container my-3">
  <div class="d-flex gap-2 flex-wrap align-items-center mb-3">
    <div class="input-group" style="max-width: 360px;">
      <span class="input-group-text">Search</span>
      <input
        class="form-control"
        type="text"
        placeholder="Name, sector, AUM, returns..."
        (input)="onSearch($any($event.target).value)"
      />
    </div>

    <div class="ms-auto d-flex gap-2 align-items-center">
      <label class="form-label mb-0">Page size</label>
      <select class="form-select" style="width: 100px;" [ngModel]="pageSize" (ngModelChange)="changePageSize($event)">
        <option [ngValue]="5">5</option>
        <option [ngValue]="10">10</option>
        <option [ngValue]="20">20</option>
        <option [ngValue]="50">50</option>
      </select>
      <button class="btn btn-outline-secondary" (click)="exportCsv()">Export CSV</button>
    </div>
  </div>

  <div class="table-responsive">
    <table class="table table-striped table-hover align-middle">
      <thead class="table-light">
        <tr>
          <th (click)="setSort('mfId')" role="button">MF ID <span class="small">{{sortIcon('mfId')}}</span></th>
          <th (click)="setSort('name')" role="button">Name <span class="small">{{sortIcon('name')}}</span></th>
          <th (click)="setSort('sector')" role="button">Sector <span class="small">{{sortIcon('sector')}}</span></th>
          <th (click)="setSort('subsector')" role="button">Subsector <span class="small">{{sortIcon('subsector')}}</span></th>
          <th (click)="setSort('option')" role="button">Option <span class="small">{{sortIcon('option')}}</span></th>
          <th class="text-end" (click)="setSort('aum')" role="button">AUM (₹ Cr) <span class="small">{{sortIcon('aum')}}</span></th>
          <th class="text-end" (click)="setSort('expRatio')" role="button">Exp. Ratio (%) <span class="small">{{sortIcon('expRatio')}}</span></th>
          <th class="text-end" (click)="setSort('ret1y')" role="button">1Y (%) <span class="small">{{sortIcon('ret1y')}}</span></th>
          <th class="text-end" (click)="setSort('ret3y')" role="button">3Y (%) <span class="small">{{sortIcon('ret3y')}}</span></th>
          <th class="text-end" (click)="setSort('ret5y')" role="button">5Y (%) <span class="small">{{sortIcon('ret5y')}}</span></th>
          <th>Link</th>
        </tr>
      </thead>

      <tbody>
        <tr *ngFor="let r of filtered | slice:(page-1)*pageSize:(page-1)*pageSize+pageSize">
          <td>{{ r.mfId }}</td>
          <td>{{ r.name }}</td>
          <td>{{ r.sector }}</td>
          <td>{{ r.subsector || '-' }}</td>
          <td>{{ r.option || '-' }}</td>
          <td class="text-end">{{ r.aum | number:'1.0-2' }}</td>
          <td class="text-end">{{ r.expRatio ?? '-' }}</td>
          <td class="text-end">{{ r.ret1y ?? '-' }}</td>
          <td class="text-end">{{ r.ret3y ?? '-' }}</td>
          <td class="text-end">{{ r.ret5y ?? '-' }}</td>
          <td>
            <a [href]="r.slug" target="_blank" rel="noopener">Open</a>
          </td>
        </tr>

        <tr *ngIf="filtered.length === 0">
          <td colspan="11" class="text-center text-muted py-4">No results</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <div class="d-flex justify-content-between align-items-center">
    <div class="text-muted small">
      Showing
      {{ Math.min((page-1)*pageSize + 1, total) }}
      –
      {{ Math.min(page*pageSize, total) }}
      of {{ total }}
    </div>

    <nav>
      <ul class="pagination mb-0">
        <li class="page-item" [class.disabled]="page === 1">
          <button class="page-link" (click)="goToPage(1)">&laquo;</button>
        </li>
        <li class="page-item" [class.disabled]="page === 1">
          <button class="page-link" (click)="goToPage(page-1)">Prev</button>
        </li>
        <li class="page-item disabled">
          <span class="page-link">Page {{page}} / {{pageCount}}</span>
        </li>
        <li class="page-item" [class.disabled]="page === pageCount">
          <button class="page-link" (click)="goToPage(page+1)">Next</button>
        </li>
        <li class="page-item" [class.disabled]="page === pageCount">
          <button class="page-link" (click)="goToPage(pageCount)">&raquo;</button>
        </li>
      </ul>
    </nav>
  </div>
</div>
```

## c) Optional CSS (nice sticky header + pointer)

`src/app/components/mf-table/mf-table.component.css`

```css
th[role="button"] { cursor: pointer; user-select: none; }
.table-responsive thead th { position: sticky; top: 0; z-index: 1; }
```

---

# 5) Module wiring

Make sure Bootstrap CSS is included (via `angular.json` or CDN in `index.html`), and import Angular modules.

`src/app/app.module.ts`

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MfTableComponent } from './components/mf-table/mf-table.component';

@NgModule({
  declarations: [AppComponent, MfTableComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Use it in your root template:

`src/app/app.component.html`

```html
<app-mf-table></app-mf-table>
```

---

# 6) Features included

* ✅ Reads JSON from `assets/mutualfunds.json`
* ✅ Global search (name/sector/subsector/option/AUM/returns)
* ✅ Click-to-sort per column (toggles asc/desc)
* ✅ Client-side pagination + page size
* ✅ CSV export of current filtered list
* ✅ Sticky table header (nice UX on long lists)

---

## Notes & Tweaks

* Your JSON has some fields optionally missing (e.g., `ret1y`/`ret3y`/`ret5y`). The table shows `-` if absent.
* If your AUM is in ₹ crores already, the number pipe displays it as-is. If it’s in a different unit, adjust formatting.
* If the table could grow to thousands of rows, consider server-side pagination later (API-backed).

Want me to package this as a ready-to-run Angular demo (component files zipped), or extend with column-specific filters and multi-sort?
