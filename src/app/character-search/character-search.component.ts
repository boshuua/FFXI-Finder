import { Component } from '@angular/core';
import { WowApiService } from '../wow-api.service';
import { CommonModule } from '@angular/common';
import { SearchFormComponent } from '../search-form/search-form.component';

@Component({
  selector: 'app-character-search',
  standalone: true,
  imports: [CommonModule, SearchFormComponent],
  templateUrl: './character-search.component.html',
  styleUrl: './character-search.component.css'
})
export class CharacterSearchComponent {
  character: any = null;
  classJobs: any = null;
  achievements: any = null;
  loading: boolean = false;
  error: any = null;

  gearSlots = [
    { key: 'Mainhand', label: 'Main Hand' },
    { key: 'Offhand', label: 'Off Hand' },
    { key: 'Head', label: 'Head' },
    { key: 'Body', label: 'Body' },
    { key: 'Hands', label: 'Hands' },
    { key: 'Legs', label: 'Legs' },
    { key: 'Feet', label: 'Feet' },
    { key: 'Earrings', label: 'Earrings' },
    { key: 'Necklace', label: 'Necklace' },
    { key: 'Bracelets', label: 'Bracelets' },
    { key: 'Ring1', label: 'Ring 1' },
    { key: 'Ring2', label: 'Ring 2' }
  ];

  displayStats = [
    { key: 'Strength', label: 'Strength', category: 'Attributes' },
    { key: 'Dexterity', label: 'Dexterity', category: 'Attributes' },
    { key: 'Vitality', label: 'Vitality', category: 'Attributes' },
    { key: 'Intelligence', label: 'Intelligence', category: 'Attributes' },
    { key: 'Mind', label: 'Mind', category: 'Attributes' },
    
    { key: 'CriticalHitRate', label: 'Critical Hit Rate', category: 'Substats' },
    { key: 'Determination', label: 'Determination', category: 'Substats' },
    { key: 'DirectHitRate', label: 'Direct Hit Rate', category: 'Substats' },
    
    { key: 'Defense', label: 'Defense', category: 'Defense' },
    { key: 'MagicDefense', label: 'Magic Defense', category: 'Defense' },
    
    { key: 'AttackPower', label: 'Attack Power', category: 'Offense' },
    { key: 'SkillSpeed', label: 'Skill Speed', category: 'Offense' },
    { key: 'AttackMagicPotency', label: 'Attack Magic Potency', category: 'Offense' },
    { key: 'HealingMagicPotency', label: 'Healing Magic Potency', category: 'Offense' },
    { key: 'SpellSpeed', label: 'Spell Speed', category: 'Offense' },
    
    { key: 'Tenacity', label: 'Tenacity', category: 'Special' },
    { key: 'Piety', label: 'Piety', category: 'Special' }
  ];

  constructor(private wowApiService: WowApiService) { }

  onSearch(searchData: { characterName: string, realm: string }) {
    this.loading = true;
    this.character = null;
    this.classJobs = null;
    this.achievements = null;
    this.error = null;

    this.wowApiService.getCharacterData(searchData.characterName, searchData.realm)
      .subscribe(
        (data: any) => {
          this.loading = false;
          // nodestone character parser returns character at data.Character
          this.character = data.Character;
          this.classJobs = data.ClassJobs;
          this.achievements = data.Achievements;
          this.error = null;
        },
        (error) => {
          this.loading = false;
          this.error = error;
          console.error(error);
        }
      );
  }

  getItemLevel(item: any): number {
    if (!item || !item.ItemLevel) return 0;
    // Extract digit values from item level string (e.g. "Item Level 530" -> 530)
    const match = String(item.ItemLevel).match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  getAverageItemLevel(): number {
    if (!this.character) return 0;
    let totalILvl = 0;
    let count = 0;
    
    this.gearSlots.forEach(slot => {
      const item = this.character[slot.key];
      if (item && item.Name) {
        const ilvl = this.getItemLevel(item);
        if (ilvl > 0) {
          totalILvl += ilvl;
          count++;
        }
      }
    });
    
    return count > 0 ? Math.round(totalILvl / count) : 0;
  }

  getMateriaList(item: any): string[] {
    if (!item) return [];
    const materias: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const materia = item[`Materia_${i}`];
      if (materia && materia.Name) {
        materias.push(materia.Name);
      }
    }
    return materias;
  }

  getJobCategories() {
    if (!this.classJobs) return [];
    
    const tanks = ['Paladin', 'Warrior', 'Darkknight', 'Gunbreaker'];
    const healers = ['Whitemage', 'Scholar', 'Astrologian', 'Sage'];
    const melee = ['Monk', 'Dragoon', 'Ninja', 'Samurai', 'Reaper', 'Viper'];
    const rangedPhys = ['Bard', 'Machinist', 'Dancer'];
    const rangedMagic = ['Blackmage', 'Summoner', 'Redmage', 'Pictomancer', 'Bluemage'];
    const crafters = ['Carpenter', 'Blacksmith', 'Armorer', 'Goldsmith', 'Leatherworker', 'Weaver', 'Alchemist', 'Culinarian'];
    const gatherers = ['Miner', 'Botanist', 'Fisher'];

    const getLevels = (jobs: string[]) => {
      return jobs.map(job => {
        const jobData = this.classJobs[job];
        return {
          name: this.formatJobName(job),
          level: jobData?.Level || 0,
          currentExp: jobData?.CurrentEXP || 0,
          maxExp: jobData?.MaxEXP || 0
        };
      });
    };

    return [
      { name: 'Tanks', jobs: getLevels(tanks), color: '#3370ff', class: 'role-tank' },
      { name: 'Healers', jobs: getLevels(healers), color: '#29c25d', class: 'role-healer' },
      { name: 'Melee DPS', jobs: getLevels(melee), color: '#e03e3e', class: 'role-dps-melee' },
      { name: 'Phys Ranged', jobs: getLevels(rangedPhys), color: '#e67e22', class: 'role-dps-ranged' },
      { name: 'Magic Ranged', jobs: getLevels(rangedMagic), color: '#9b59b6', class: 'role-dps-caster' },
      { name: 'Crafters (DoH)', jobs: getLevels(crafters), color: '#b58252', class: 'role-doh' },
      { name: 'Gatherers (DoL)', jobs: getLevels(gatherers), color: '#3498db', class: 'role-dol' }
    ];
  }

  formatJobName(job: string): string {
    if (job === 'Darkknight') return 'Dark Knight';
    if (job === 'Whitemage') return 'White Mage';
    if (job === 'Blackmage') return 'Black Mage';
    if (job === 'Redmage') return 'Red Mage';
    if (job === 'Bluemage') return 'Blue Mage';
    return job;
  }
}
