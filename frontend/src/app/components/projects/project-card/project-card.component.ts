import { Component, Input } from '@angular/core';


// SERVICES
import { MultilangService } from 'src/app/services/multilang.service';

// INTERFACES
import { Project } from 'src/app/interfaces/project';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css']
})
export class ProjectCardComponent {

  @Input('project') public project: Project;
  @Input('itsMyProject') public itsMyProject: boolean;
  @Input('hideLogo') public hideLogo: boolean;
  @Input('titleColor') public titleColor: string;
  @Input('textColor') public textColor: string;
  @Input('bgColor') public bgColor: string;
  @Input('noMargin') public noMargin: boolean;

  constructor(public _multilangService: MultilangService){}

}
