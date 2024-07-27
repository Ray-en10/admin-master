import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Echange } from 'src/app/models/echange';
import { EchangeService } from 'src/app/services/echange.service';

@Component({
  selector: 'app-echange',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, DatePipe],
  templateUrl: './echange.component.html',
  styleUrls: ['./echange.component.scss']
})
export class EchangeComponent implements OnInit {
  echanges: Echange[] = [];
  filteredEchangesEncour: Echange[] = [];
  filteredEchangesValider: Echange[] = [];
  filteredEchangesAnnuler: Echange[] = [];
  paginatedEchangesEncour: Echange[] = [];
  paginatedEchangesValider: Echange[] = [];
  paginatedEchangesAnnuler: Echange[] = [];
  selectedEchange: Echange | null = null;
  showModal: boolean = false;

  codeFilter: string = '';
  timeFilter: string = '';

  codeOrder: string = 'asc';
  dateOrder: string = 'asc';

  currentPageEncour: number = 1;
  currentPageValider: number = 1;
  currentPageAnnuler: number = 1;
  itemsPerPage: number = 5;
  pagesEncour: number[] = [];
  pagesValider: number[] = [];
  pagesAnnuler: number[] = [];

  constructor(private echangeService: EchangeService) {}

  ngOnInit(): void {
    this.fetchEchanges();
  }

  fetchEchanges(): void {
    this.echangeService.getAllEchanges().subscribe((data) => {
      this.echanges = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredEchangesEncour = this.echanges.filter(echange =>
      (!this.codeFilter || (echange.client?.code.includes(this.codeFilter) || echange.responsable?.codeResponsable.includes(this.codeFilter))) &&
      (!this.timeFilter || new Date(echange.createdAt!).toISOString().slice(0, 10) === this.timeFilter) &&
      echange.state === 'en cours'
    );
    this.filteredEchangesValider = this.echanges.filter(echange =>
      (!this.codeFilter || (echange.client?.code.includes(this.codeFilter) || echange.responsable?.codeResponsable.includes(this.codeFilter))) &&
      (!this.timeFilter || new Date(echange.createdAt!).toISOString().slice(0, 10) === this.timeFilter) &&
      echange.state === 'valider'
    );
    this.filteredEchangesAnnuler = this.echanges.filter(echange =>
      (!this.codeFilter || (echange.client?.code.includes(this.codeFilter) || echange.responsable?.codeResponsable.includes(this.codeFilter))) &&
      (!this.timeFilter || new Date(echange.createdAt!).toISOString().slice(0, 10) === this.timeFilter) &&
      echange.state === 'annuler'
    );
    this.updatePagination();
  }

  updatePagination(): void {
    this.updatePaginationForState('en cours');
    this.updatePaginationForState('valider');
    this.updatePaginationForState('annuler');
  }

  updatePaginationForState(state: string): void {
    let filteredEchanges;
    let currentPage;
    let pages;

    if (state === 'en cours') {
      filteredEchanges = this.filteredEchangesEncour;
      currentPage = this.currentPageEncour;
      pages = this.pagesEncour;
    } else if (state === 'valider') {
      filteredEchanges = this.filteredEchangesValider;
      currentPage = this.currentPageValider;
      pages = this.pagesValider;
    } else {
      filteredEchanges = this.filteredEchangesAnnuler;
      currentPage = this.currentPageAnnuler;
      pages = this.pagesAnnuler;
    }

    const totalPages = Math.ceil(filteredEchanges.length / this.itemsPerPage);
    pages.length = 0;
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    this.changePage(currentPage, state);
  }

  changePage(page: number, state: string): void {
    let filteredEchanges;
    let paginatedEchanges;
    if (state === 'en cours') {
      this.currentPageEncour = page;
      filteredEchanges = this.filteredEchangesEncour;
      paginatedEchanges = this.paginatedEchangesEncour;
    } else if (state === 'valider') {
      this.currentPageValider = page;
      filteredEchanges = this.filteredEchangesValider;
      paginatedEchanges = this.paginatedEchangesValider;
    } else {
      this.currentPageAnnuler = page;
      filteredEchanges = this.filteredEchangesAnnuler;
      paginatedEchanges = this.paginatedEchangesAnnuler;
    }

    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    paginatedEchanges.length = 0;
    for (let i = startIndex; i < endIndex && i < filteredEchanges.length; i++) {
      paginatedEchanges.push(filteredEchanges[i]);
    }
  }

  toggleCodeOrder(state: string): void {
    this.codeOrder = this.codeOrder === 'asc' ? 'desc' : 'asc';
    this.sortEchangesByCode(state);
  }

  toggleDateOrder(state: string): void {
    this.dateOrder = this.dateOrder === 'asc' ? 'desc' : 'asc';
    this.sortEchangesByDate(state);
  }

  sortEchangesByCode(state: string): void {
    let filteredEchanges;
    if (state === 'en cours') {
      filteredEchanges = this.filteredEchangesEncour;
    } else if (state === 'valider') {
      filteredEchanges = this.filteredEchangesValider;
    } else {
      filteredEchanges = this.filteredEchangesAnnuler;
    }

    filteredEchanges.sort((a, b) => {
      if (!a.client?.code || !b.client?.code) return 0;
      return this.codeOrder === 'asc' ? a.client.code.localeCompare(b.client.code) : b.client.code.localeCompare(a.client.code);
    });
    this.updatePaginationForState(state);
  }

  sortEchangesByDate(state: string): void {
    let filteredEchanges;
    if (state === 'en cours') {
      filteredEchanges = this.filteredEchangesEncour;
    } else if (state === 'valider') {
      filteredEchanges = this.filteredEchangesValider;
    } else {
      filteredEchanges = this.filteredEchangesAnnuler;
    }

    filteredEchanges.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return this.dateOrder === 'asc' ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    this.updatePaginationForState(state);
  }

  showDetails(echange: Echange): void {
    this.selectedEchange = echange;
    this.showModal = true;
  }

  hideDetails(): void {
    this.showModal = false;
    this.selectedEchange = null;
  }

  validerDemande(echange: Echange): void {
    this.updateEchangeStatus(echange.codeEchange, 'valider');
  }

  annulerDemande(echange: Echange): void {
    this.updateEchangeStatus(echange.codeEchange, 'annuler');
  }

  updateEchangeStatus(id: number, status: string): void {
    this.echangeService.updateEchangeStatus(id, status).subscribe((updatedEchange) => {
      const index = this.echanges.findIndex(e => e.codeEchange === id);
      if (index !== -1) {
        this.echanges[index].state = updatedEchange.state;
        this.applyFilters();
      }
    });
  }

  updateEchangeLivrerState(id: number, livrer: boolean): void {
    this.echangeService.updateEchangeLivrerState(id, livrer).subscribe((updatedEchange) => {
      const index = this.echanges.findIndex(e => e.codeEchange === id);
      if (index !== -1) {
        this.echanges[index].livrer = updatedEchange.livrer;
        this.applyFilters();
      }
    });
  }
}
