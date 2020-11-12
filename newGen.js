function newGen() {
  if (generation == 0 && !prev_gen) {
    indivs = new p5.Table();

    indivs.addColumn("score");
    indivs.addColumn("height");
    indivs.addColumn("holes");
    indivs.addColumn("clears");


    for (let i = 0; i < population; i++) {
      let newRow = indivs.addRow();

      //creates random coefficients for each subject
      newRow.setNum("height", random(-100, 100));
      newRow.setNum("holes", random(-100, 100));
      newRow.setNum("clears", random(-100, 100));
    }
  } else if (generation > 0 || prev_gen) { //if there is previous generation data, mutate based on that
    let new_indivs = new p5.Table();

    new_indivs.addColumn("score");
    new_indivs.addColumn("height");
    new_indivs.addColumn("holes");
    new_indivs.addColumn("clears");

    //find best subject
    let best_score = -1;
    let best_subject = -1;
    for (let i = 0; i < population; i++) {
      if (indivs.getNum(i, "score") > best_score) {
        best_score = indivs.getNum(i, "score");
        best_subject = i;
      }
    }

    //clones best subject into new generation
    let immortal_subject = new_indivs.addRow();
    immortal_subject.setNum("height", indivs.getNum(best_subject, "height"));
    immortal_subject.setNum("holes", indivs.getNum(best_subject, "holes"));
    immortal_subject.setNum("clears", indivs.getNum(best_subject, "clears"));

    //calculates total score
    let total_score = 0;
    for (let i = 0; i < population; i++) {
      total_score += indivs.getNum(i, "score");
    }

    //creates new population with randomization
    for (let i = 1; i < population; i++) {
      //finds parent
      let rand = random(0, total_score);
      let parent;
      let bound = 0;
      for (let j = 0; j < population; j++) {
        bound += indivs.getNum(j, "score");
        if (rand <= bound) {
          parent = j;
          break;
        }
      }

      //clones parent
      let newRow = new_indivs.addRow();
      newRow.setNum("height", indivs.getNum(parent, "height"));
      newRow.setNum("holes", indivs.getNum(parent, "holes"));
      newRow.setNum("clears", indivs.getNum(parent, "clears"));

      //mutates new generation (should it be multiplied or added?)
      let mut_height = newRow.getNum("height") + random(-mutation_strength, mutation_strength);
      let mut_holes = newRow.getNum("holes") + random(-mutation_strength, mutation_strength);
      let mut_clears = newRow.getNum("clears") + random(-mutation_strength, mutation_strength);

      newRow.setNum("height", mut_height);
      newRow.setNum("holes", mut_holes);
      newRow.setNum("clears", mut_clears);
    }

    indivs = new_indivs;
    subject = 0;
  }
}