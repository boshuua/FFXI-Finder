import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.css'
})
export class SearchFormComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  realm: string = '';
  realmSearchText: string = '';
  showRealmDropdown: boolean = false;

  @Output() searchEvent = new EventEmitter<{ characterName: string, realm: string }>();

  // Full FFXIV Worlds list sorted alphabetically
  ffxivWorlds: string[] = [
    // NA Worlds
    'Adamantoise', 'Balmung', 'Behemoth', 'Brynhildr', 'Cactuar', 'Coeurl', 'Cuchulainn', 'Diabolos', 
    'Excalibur', 'Exodus', 'Faerie', 'Famfrit', 'Geryon', 'Gilgamesh', 'Goblin', 'Halicarnassus', 
    'Hyperion', 'Jenova', 'Kraken', 'Lamia', 'Leviathan', 'Maduin', 'Malboro', 'Marilith', 
    'Mateus', 'Midgardsormr', 'Rafflesia', 'Sargatanas', 'Seraph', 'Siren', 'Ultros', 'Zalera',
    // EU Worlds
    'Alpha', 'Cerberus', 'Lich', 'Louisoix', 'Moogle', 'Odin', 'Omega', 'Phantom', 
    'Phoenix', 'Ragnarok', 'Raiden', 'Sagittarius', 'Shiva', 'Spriggan', 'Twintania', 'Zodiark',
    // JP Worlds
    'Aegis', 'Alexander', 'Anima', 'Asura', 'Atomos', 'Bahamut', 'Belias', 'Carbuncle', 
    'Chocobo', 'Durandal', 'Fenrir', 'Garuda', 'Gungnir', 'Hades', 'Ifrit', 'Kujata', 
    'Mandragora', 'Masamune', 'Pandaemonium', 'Ramuh', 'Ridill', 'Shinryu', 'Tiamat', 'Titan', 
    'Tonberry', 'Typhon', 'Valefor', 'Yojimbo', 'Zeromus',
    // OCE Worlds
    'Bismarck', 'Ravana', 'Sephirot', 'Sophia', 'Zurvan'
  ].sort();

  filteredRealms: string[] = [];

  constructor() {
    this.filteredRealms = this.ffxivWorlds;
  }

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const server = params.get('server');
    if (name) {
      const parts = name.trim().split(/\s+/);
      this.firstName = parts[0] || '';
      this.lastName = parts.slice(1).join(' ') || '';
    }
    if (server) {
      this.realm = server;
      this.realmSearchText = server;
    }
  }

  searchCharacter() {
    if (this.firstName && this.lastName && this.realm) {
      const fullName = `${this.firstName.trim()} ${this.lastName.trim()}`;
      this.searchEvent.emit({ characterName: fullName, realm: this.realm });
    }
  }

  onRealmSearchChange() {
    const search = this.realmSearchText.toLowerCase();
    if (search === '') {
      this.filteredRealms = this.ffxivWorlds;
    } else {
      this.filteredRealms = this.ffxivWorlds.filter(world =>
        world.toLowerCase().includes(search)
      );
    }
    this.showRealmDropdown = true;
  }

  selectRealm(world: string) {
    this.realm = world;
    this.realmSearchText = world;
    this.showRealmDropdown = false;
  }

  onRealmInputFocus() {
    this.showRealmDropdown = true;
    this.onRealmSearchChange();
  }

  onRealmInputBlur() {
    // Delay to allow click on dropdown item to register
    setTimeout(() => {
      this.showRealmDropdown = false;
    }, 250);
  }
}