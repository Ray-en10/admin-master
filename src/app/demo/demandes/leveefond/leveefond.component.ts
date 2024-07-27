import { Component, OnInit } from '@angular/core';
import { Leveefond } from '../../../models/leveefond';
import { LeveefondService } from '../../../services/leveefond.service';

@Component({
  selector: 'app-leveefond',
  templateUrl: './leveefond.component.html',
  styleUrls: ['./leveefond.component.scss']
})
export class LeveefondComponent implements OnInit {
  leveefonds: Leveefond[] = [];
  filteredLeveefondEncour: Leveefond[] = [];
  filteredLeveefondValider: Leveefond[] = [];
  filteredLeveefondAnnuler: Leveefond[] = [];
  paginatedLeveefondEncour: Leveefond[] = [];
  paginatedLeveefondValider: Leveefond[] = [];
  paginatedLeveefondAnnuler: Leveefond[] = [];
  selectedLeveefondItem: Leveefond | null = null;
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

  constructor(private leveefondService: LeveefondService) {}

  ngOnInit(): void {
    this.fetchLeveefonds();
  }

  fetchLeveefonds(): void {
    this.leveefondService.getLV().subscribe((data) => {
      this.leveefonds = data;
      console.log('Fetched leveefonds:', this.leveefonds); // Debugging log
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredLeveefondEncour = this.leveefonds.filter(leveefond =>
      (!this.codeFilter || (leveefond.client?.code.includes(this.codeFilter) || leveefond.responsable?.codeResponsable.includes(this.codeFilter))) &&
      (!this.timeFilter || new Date(leveefond.createdAt!).toISOString().slice(0, 10) === this.timeFilter) &&
      leveefond.state === 'en cours'
    );
    this.filteredLeveefondValider = this.leveefonds.filter(leveefond =>
      (!this.codeFilter || leveefond.client.code.includes(this.codeFilter)) &&
      (!this.timeFilter || new Date(leveefond.createdAt!).toISOString().slice(0, 10) === this.timeFilter) &&
      leveefond.state === 'valider'
    );
    this.filteredLeveefondAnnuler = this.leveefonds.filter(leveefond =>
      (!this.codeFilter || leveefond.client.code.includes(this.codeFilter)) &&
      (!this.timeFilter || new Date(leveefond.createdAt!).toISOString().slice(0, 10) === this.timeFilter) &&
      leveefond.state === 'annuler'
    );

    console.log('Filtered leveefonds (encour):', this.filteredLeveefondEncour);
    console.log('Filtered leveefonds (valider):', this.filteredLeveefondValider);
    console.log('Filtered leveefonds (annuler):', this.filteredLeveefondAnnuler);

    this.updatePagination();
  }

  updatePagination(): void {
    this.updatePaginationForState('en cours');
    this.updatePaginationForState('valider');
    this.updatePaginationForState('annuler');
  }

  updatePaginationForState(state: string): void {
    let filteredLeveefonds;
    let currentPage;
    let pages;

    if (state === 'en cours') {
      filteredLeveefonds = this.filteredLeveefondEncour;
      currentPage = this.currentPageEncour;
      pages = this.pagesEncour;
    } else if (state === 'valider') {
      filteredLeveefonds = this.filteredLeveefondValider;
      currentPage = this.currentPageValider;
      pages = this.pagesValider;
    } else {
      filteredLeveefonds = this.filteredLeveefondAnnuler;
      currentPage = this.currentPageAnnuler;
      pages = this.pagesAnnuler;
    }

    const totalPages = Math.ceil(filteredLeveefonds.length / this.itemsPerPage);
    pages.length = 0;
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    this.changePage(currentPage, state);
  }

  changePage(page: number, state: string): void {
    let filteredLeveefonds;
    let paginatedLeveefonds;
    if (state === 'en cours') {
      this.currentPageEncour = page;
      filteredLeveefonds = this.filteredLeveefondEncour;
      paginatedLeveefonds = this.paginatedLeveefondEncour;
    } else if (state === 'valider') {
      this.currentPageValider = page;
      filteredLeveefonds = this.filteredLeveefondValider;
      paginatedLeveefonds = this.paginatedLeveefondValider;
    } else {
      this.currentPageAnnuler = page;
      filteredLeveefonds = this.filteredLeveefondAnnuler;
      paginatedLeveefonds = this.paginatedLeveefondAnnuler;
    }

    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    paginatedLeveefonds.length = 0;
    for (let i = startIndex; i < endIndex && i < filteredLeveefonds.length; i++) {
      paginatedLeveefonds.push(filteredLeveefonds[i]);
    }
  }

  toggleCodeOrder(state: string): void {
    this.codeOrder = this.codeOrder === 'asc' ? 'desc' : 'asc';
    this.sortLeveefondsByCode(state);
  }

  toggleDateOrder(state: string): void {
    this.dateOrder = this.dateOrder === 'asc' ? 'desc' : 'asc';
    this.sortLeveefondsByDate(state);
  }

  sortLeveefondsByCode(state: string): void {
    let filteredLeveefonds;
    if (state === 'en cours') {
      filteredLeveefonds = this.filteredLeveefondEncour;
    } else if (state === 'valider') {
      filteredLeveefonds = this.filteredLeveefondValider;
    } else {
      filteredLeveefonds = this.filteredLeveefondAnnuler;
    }

    filteredLeveefonds.sort((a, b) => {
      if (!a.client?.code || !b.client?.code) return 0;
      return this.codeOrder === 'asc' ? a.client.code.localeCompare(b.client.code) : b.client.code.localeCompare(a.client.code);
    });
    this.updatePaginationForState(state);
  }

  sortLeveefondsByDate(state: string): void {
    let filteredLeveefonds;
    if (state === 'en cours') {
      filteredLeveefonds = this.filteredLeveefondEncour;
    } else if (state === 'valider') {
      filteredLeveefonds = this.filteredLeveefondValider;
    } else {
      filteredLeveefonds = this.filteredLeveefondAnnuler;
    }

    filteredLeveefonds.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return this.dateOrder === 'asc' ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    this.updatePaginationForState(state);
  }

  showDetails(leveefondItem: Leveefond): void {
    this.selectedLeveefondItem = leveefondItem;
    this.showModal = true;
  }

  hideDetails(): void {
    this.showModal = false;
    this.selectedLeveefondItem = null;
  }

  validerDemande(leveefond: Leveefond): void {
    this.updateLeveefondStatus(leveefond.codeLV, 'valider');
  }

  annulerDemande(leveefond: Leveefond): void {
    this.updateLeveefondStatus(leveefond.codeLV, 'annuler');
  }

  updateLeveefondStatus(id: number, status: string): void {
    this.leveefondService.updateStatus(id, status).subscribe(() => {
      const updatedLeveefond = this.leveefonds.find(l => l.codeLV === id);
      if (updatedLeveefond) {
        updatedLeveefond.state = status;
        this.applyFilters();
      }
    });
  }
}
