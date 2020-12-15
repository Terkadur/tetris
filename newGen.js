function newGen() {
  if (generation == 0 && !prev_gen) {
    indivs = new p5.Table();

    indivs.addColumn("score");
    indivs.addColumn("height");
    indivs.addColumn("holes");
    indivs.addColumn("clears");
    indivs.addColumn("pillars");
    indivs.addColumn("bumps");
    indivs.addColumn("ledges");
    indivs.addColumn("buries");

    for (let i = 0; i < current_pop; i++) {
      let newRow = indivs.addRow();

      //creates random coefficients for each subject
      //KINDA CHEATY SETTING SIGN OF COEFFICIENTS
      newRow.setNum("height", random(0, 100));
      newRow.setNum("holes", random(0, 100));
      newRow.setNum("clears", random(-100, 0));
      newRow.setNum("pillars", random(0, 100));
      newRow.setNum("bumps", random(0, 100));
      newRow.setNum("ledges", random(0, 100));
      newRow.setNum("buries", random(-100, 100));
    }
  } else if (generation > 0 || prev_gen) { //if there is previous generation data, mutate based on that
    let new_indivs = new p5.Table();

    new_indivs.addColumn("score");
    new_indivs.addColumn("height");
    new_indivs.addColumn("holes");
    new_indivs.addColumn("clears");
    new_indivs.addColumn("pillars");
    new_indivs.addColumn("bumps");
    new_indivs.addColumn("ledges");
    new_indivs.addColumn("buries");
    

    //find best subject
    let best_score = -1;
    let best_subject = -1;
    for (let i = 0; i < current_pop; i++) {
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
    immortal_subject.setNum("pillars", indivs.getNum(best_subject, "pillars"));
    immortal_subject.setNum("bumps", indivs.getNum(best_subject, "bumps"));
    immortal_subject.setNum("ledges", indivs.getNum(best_subject, "ledges"));
    immortal_subject.setNum("buries", indivs.getNum(best_subject, "buries"));

    if (best_score > best_data[1]) {
      best_data = [String(generation - 1) + ":" + String(best_subject)];
      best_data.push(best_score);
      best_data.push(indivs.getNum(best_subject, "height"));
      best_data.push(indivs.getNum(best_subject, "holes"));
      best_data.push(indivs.getNum(best_subject, "clears"));
      best_data.push(indivs.getNum(best_subject, "pillars"));
      best_data.push(indivs.getNum(best_subject, "bumps"));
      best_data.push(indivs.getNum(best_subject, "ledges"));
      best_data.push(indivs.getNum(best_subject, "buries"));
    }

    //calculates total score
    let total_score = 0;
    for (let i = 0; i < current_pop; i++) {
      total_score += indivs.getNum(i, "score");
    }

    //creates new population with randomization
    for (let i = 1; i < next_pop; i++) {
      //finds parent
      let rand = random(0, total_score);
      let parent;
      let bound = 0;
      for (let j = 0; j < current_pop; j++) {
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
      newRow.setNum("pillars", indivs.getNum(parent, "pillars"));
      newRow.setNum("bumps", indivs.getNum(parent, "bumps"));
      newRow.setNum("ledges", indivs.getNum(parent, "ledges"));
      newRow.setNum("buries", indivs.getNum(parent, "buries"));

      //mutates new generation (should it be multiplied or added?)
      let mut_height = newRow.getNum("height") + random(-mutation_strength, mutation_strength);
      let mut_holes = newRow.getNum("holes") + random(-mutation_strength, mutation_strength);
      let mut_clears = newRow.getNum("clears") + random(-mutation_strength, mutation_strength);
      let mut_pillars = newRow.getNum("pillars") + random(-mutation_strength, mutation_strength);
      let mut_bumps = newRow.getNum("bumps") + random(-mutation_strength, mutation_strength);
      let mut_ledges = newRow.getNum("ledges") + random(-mutation_strength, mutation_strength);
      let mut_buries = newRow.getNum("buries") + random(-mutation_strength, mutation_strength);

      newRow.setNum("height", mut_height);
      newRow.setNum("holes", mut_holes);
      newRow.setNum("clears", mut_clears);
      newRow.setNum("pillars", mut_pillars);
      newRow.setNum("bumps", mut_bumps);
      newRow.setNum("ledges", mut_ledges);
      newRow.setNum("buries", mut_buries);
    }

    indivs = new_indivs;
    subject = 0;
    mutation_strength *= 0.95;
    current_pop = next_pop;
  }
}