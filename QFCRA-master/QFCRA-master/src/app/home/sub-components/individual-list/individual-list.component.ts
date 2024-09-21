import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-individual-list',
  templateUrl: './individual-list.component.html',
  styleUrls: ['./individual-list.component.scss']
})
export class IndividualListComponent implements OnInit, OnDestroy{
  isModalVisible: boolean = false;
  removeMouseMoveListener!: () => void;
  removeMouseUpListener!: () => void;
  private initialX = 0;
  private initialY = 0;
  private initialMouseX = 0;
  private initialMouseY = 0;
  private isDragging = false;

  constructor(private router: Router,private renderer: Renderer2) {}

  ngOnInit() {
    
  }

  ngOnDestroy() {
    // Clean up listeners on destroy to avoid memory leaks
    this.removeListeners();
  }

  showModal() {
    this.isModalVisible = true;
    setTimeout(() => this.makeModalDraggable(), 0);
  }

  hideModal() {
    this.isModalVisible = false;
    this.resetModalPosition();
  }

  makeModalDraggable() {
    const modal = document.getElementById('draggableModal');
    const header = document.getElementById('modalHeader');


    const onMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      if (this.isDragging && modal) {
        const deltaX = event.clientX - this.initialMouseX;
        const deltaY = event.clientY - this.initialMouseY;
        modal.style.top = `${this.initialY + deltaY}px`;
        modal.style.left = `${this.initialX + deltaX}px`;
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      if (modal) {
        const rect = modal.getBoundingClientRect();
        this.initialX = rect.left;
        this.initialY = rect.top;
        this.initialMouseX = event.clientX;
        this.initialMouseY = event.clientY;
        this.isDragging = true;
      }

      this.removeMouseMoveListener = this.renderer.listen('document', 'mousemove', onMouseMove);
      this.removeMouseUpListener = this.renderer.listen('document', 'mouseup', onMouseUp);
    };

    const onMouseUp = () => {
      this.isDragging = false;
      this.removeListeners()
    };

    if (header) {
    header.addEventListener('mousedown', onMouseDown);
    }
  }
  removeListeners() {
    if (this.removeMouseMoveListener) {
      this.removeMouseMoveListener();
    }
    if (this.removeMouseUpListener) {
      this.removeMouseUpListener();
    }
    this.isDragging = false;
  }

  resetModalPosition() {
    const modal = document.getElementById('draggableModal');
    if (modal) {
      modal.style.top = '';
      modal.style.left = '';
    }
  }
  viewIndividual() {
    this.router.navigate(['home/view-individual'])
  }
}
