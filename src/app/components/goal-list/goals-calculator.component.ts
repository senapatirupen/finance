import { Component, OnInit } from '@angular/core';
import { GoalService } from '../../services/goal.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Goal } from 'src/app/model/goal.model';

@Component({
  selector: 'app-goals-calculator',
  templateUrl: './goals-calculator.component.html',
  styleUrls: ['./goals-calculator.component.scss']
})
export class GoalsCalculatorComponent implements OnInit {
  goals: Goal[] = [];
  categories = ['short-term', 'medium-term', 'long-term', 'retirement'];
  totalAmount = 0;
  inflationRate = 6; // Default inflation rate
  goalForm: FormGroup;
  isEditing = false;
  currentEditId: number | null = null;

  constructor(
    private goalService: GoalService,
    private fb: FormBuilder
  ) {
    this.goalForm = this.fb.group({
      name: ['', Validators.required],
      category: ['short-term', Validators.required],
      duration: [null, [Validators.required, Validators.min(1)]],
      targetAmount: [null, [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    this.goalService.getGoals().subscribe(goals => {
      this.goals = goals;
      this.calculateTotals();
    });
  }

  addGoal(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.goalForm.reset({ category: 'short-term' });
  }

  editGoal(goal: Goal): void {
    this.isEditing = true;
    this.currentEditId = goal.id || null;
    this.goalForm.patchValue({
      name: goal.name,
      category: goal.category,
      duration: goal.duration,
      targetAmount: goal.targetAmount,
      notes: goal.notes
    });
  }

  saveGoal(): void {
    if (this.goalForm.valid) {
      const goalData: Goal = this.goalForm.value;
      
      // Calculate inflation adjusted amount
      if (goalData.targetAmount && goalData.duration) {
        goalData.inflationAdjustedAmount = this.goalService.calculateInflationAdjustedAmount(
          goalData.targetAmount, 
          goalData.duration,
          this.inflationRate
        );
      }

      if (this.isEditing && this.currentEditId) {
        this.goalService.updateGoal(this.currentEditId, goalData)
          .subscribe(() => {
            this.loadGoals();
            this.goalForm.reset({ category: 'short-term' });
          });
      } else {
        this.goalService.addGoal(goalData)
          .subscribe(() => {
            this.loadGoals();
            this.goalForm.reset({ category: 'short-term' });
          });
      }
    }
  }

  deleteGoal(id: number): void {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.goalService.deleteGoal(id).subscribe(() => {
        this.loadGoals();
      });
    }
  }

  calculateTotals(): void {
    this.totalAmount = 0;
    this.goals.forEach(goal => {
      if (goal.inflationAdjustedAmount) {
        this.totalAmount += goal.inflationAdjustedAmount;
      } else if (goal.targetAmount) {
        this.totalAmount += goal.targetAmount;
      }
    });
  }

  updateInflationRate(): void {
    this.goals.forEach(goal => {
      if (goal.targetAmount && goal.duration) {
        goal.inflationAdjustedAmount = this.goalService.calculateInflationAdjustedAmount(
          goal.targetAmount, 
          goal.duration,
          this.inflationRate
        );
      }
    });
    this.calculateTotals();
  }

  getCategoryClass(category: string): string {
    switch(category) {
      case 'short-term': return 'bg-info text-white';
      case 'medium-term': return 'bg-primary text-white';
      case 'long-term': return 'bg-warning';
      case 'retirement': return 'bg-danger text-white';
      default: return '';
    }
  }

  getCategoryTotal(category: string): number {
    return this.goals
      .filter(goal => goal.category === category)
      .reduce((sum, goal) => {
        return sum + (goal.inflationAdjustedAmount || goal.targetAmount || 0);
      }, 0);
  }

}