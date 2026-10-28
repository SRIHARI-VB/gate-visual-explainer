/* ==========================================================================
   spatial-aptitude — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'what',
      n: 1,
      title: 'What a spatial question actually asks',
      start: 0, end: 30,
      objective: 'Frame the four shape operations the syllabus names, and see that every question is settled by a written test rather than by staring at the picture.'
    },
    {
      id: 'rigid',
      n: 2,
      title: 'Translation, rotation, scaling: what each one keeps',
      start: 30, end: 60,
      objective: 'Separate the three operations that preserve the figure from the one that reverses it, and name the invariant each one preserves.'
    },
    {
      id: 'mirror',
      n: 3,
      title: 'Mirror against rotation: the one distinction',
      start: 60, end: 90,
      objective: 'Decide between a rotation and a mirror by reading the clockwise order of three labelled corners, and see that the two do not commute.'
    },
    {
      id: 'symmetry',
      n: 4,
      title: 'Counting lines of symmetry and rotational order',
      start: 90, end: 120,
      objective: 'Count lines of symmetry and rotational order for small grid shapes, and check both against the size of the symmetry group.'
    },
    {
      id: 'fold',
      n: 5,
      title: 'Folding: layers double and the long edge changes',
      start: 120, end: 150,
      objective: 'Track dimensions and layer count through a sequence of folds, and find the long edge again after each fold.'
    },
    {
      id: 'cut',
      n: 6,
      title: 'Cutting through a folded stack',
      start: 150, end: 180,
      objective: 'Count holes as punches times layers, and locate them by unfolding with reflections across each fold line.'
    },
    {
      id: 'net',
      n: 7,
      title: 'Cube nets and the opposite-face rule',
      start: 180, end: 210,
      objective: 'Fold a net by rolling a cube across it, and identify opposite faces without any folding.'
    },
    {
      id: 'cuts3d',
      n: 8,
      title: 'Minimum straight cuts in three dimensions',
      start: 210, end: 240,
      objective: 'Use the product formula for pieces and the sum formula for cuts, and see why eight pieces need three cuts.'
    },
    {
      id: 'tiling',
      n: 9,
      title: 'Patterns and tiling: area and colour',
      start: 240, end: 270,
      objective: 'Settle a tiling question with two arithmetic tests — area divisibility, then the chessboard colour count.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The five-step procedure',
      start: 270, end: 300,
      objective: 'Compress the lesson into a procedure that starts from the wording of the question and ends with a number.'
    }
  ],

  events: [

    /* ---------------- scene 1: what ---------------- */
    {
      id: 'wh-1', scene: 'what', start: 0, end: 7.5,
      caption: 'A spatial question shows one figure and its image, and asks which operation produced the second.',
      detail: 'Every question in this area has the same skeleton: a starting figure, a result, and a gap in the middle. The gap is one of translation, rotation, scaling or mirroring, sometimes in sequence. The figure is only the data; the operation is the answer.',
      narration: 'A spatial question almost always shows you one figure and then its image, and asks what happened in between. The picture is the data. The operation is the answer.',
      keyword: 'which operation',
      trap: 'The options are often four pictures, not four words. Eliminate with a property, never by feel.'
    },
    {
      id: 'wh-2', scene: 'what', start: 7.5, end: 15,
      caption: 'The syllabus names four operations on shapes: translation, rotation, scaling and mirroring.',
      detail: 'The GATE General Aptitude syllabus lists, under Spatial Aptitude, the transformation of shapes by translation, rotation, scaling, mirroring, assembling and grouping. Assembling and grouping are the same four operations applied to pieces rather than to a whole figure.',
      narration: 'The syllabus names the operations exactly: translation, rotation, scaling and mirroring, plus assembling and grouping. Grouping is not a fifth operation; it is the same four applied to pieces instead of a whole.',
      keyword: 'translation, rotation, scaling, mirroring',
      trap: 'Assembling and grouping are listed as operations, so a question can ask which pieces combine, not only which single move was made.'
    },
    {
      id: 'wh-3', scene: 'what', start: 15, end: 22.5,
      caption: 'Two more families follow from them: paper folding and cutting, and patterns in two and three dimensions.',
      detail: 'Paper folding and cutting are sequences of reflections, so they are mirroring applied repeatedly. Patterns in two and three dimensions are the same question asked of a solid: which face, which view, how many pieces.',
      narration: 'Then two families follow from those four. Paper folding and cutting are just reflections, applied several times in order. And patterns in two and three dimensions ask the same question of a solid: which face, which view, how many pieces.',
      keyword: 'folding, cutting, patterns',
      trap: 'A folding question is a mirroring question with a stack attached. Solve it with reflections, not with imagination.'
    },
    {
      id: 'wh-4', scene: 'what', start: 22.5, end: 30,
      caption: 'Every question here is answerable by a written test, not by guessing at a picture.',
      detail: 'Four tests cover the area: the order of labelled corners separates mirror from rotation; dimensions and layer counts settle folding; the product formula settles cuts; area and colour settle tiling. Each one is a computation you can do on paper.',
      narration: 'And the important part: every question in this area can be answered by a written test. The order of three corners. A dimension and a layer count. A product. Two counts of colour. This lesson is those tests.',
      keyword: 'written test',
      trap: 'Answering by intuition is what the options are designed to punish. Write the test down.'
    },

    /* ---------------- scene 2: rigid ---------------- */
    {
      id: 'rg-1', scene: 'rigid', start: 30, end: 37.5,
      caption: 'A translation slides the figure. Nothing about its shape, size or orientation changes.',
      detail: 'Adding the same vector to every point moves the figure without changing any distance or angle. Size is preserved, orientation is preserved, position changes. This is the only one of the four operations that changes nothing except where the figure is.',
      narration: 'A translation slides the figure. Every point moves by the same amount, so no distance and no angle changes. Size stays, orientation stays, only the position moves.',
      keyword: 'slides, position only',
      trap: 'A translation is the only operation that changes nothing but position, so it is the first thing to rule out.'
    },
    {
      id: 'rg-2', scene: 'rigid', start: 37.5, end: 45,
      caption: 'A rotation turns it about a point. Size and shape survive; the figure now faces a different way.',
      detail: 'A rotation by angle theta about a centre preserves every distance, so it preserves shape and size. What changes is direction: a corner that pointed east now points north after a quarter turn.',
      narration: 'A rotation turns the figure about a point. Distances are preserved, so the shape and the size survive exactly. What changes is which way the figure faces.',
      keyword: 'size survives, direction changes',
      trap: 'A rotation of a square by ninety degrees looks like the square, which is why squares are the worst example to reason from.'
    },
    {
      id: 'rg-3', scene: 'rigid', start: 45, end: 52.5,
      caption: 'A scaling multiplies every distance by the same factor. Angles survive, lengths do not.',
      detail: 'A uniform scaling by k sends every distance to k times itself. Angles are unchanged, and the shape is similar but not congruent. Area goes as k squared, which is the fact most area questions in this section rest on.',
      narration: 'A scaling multiplies every distance by the same number. The angles all survive, the lengths do not. And the area changes by that factor squared, which is where the area questions come from.',
      keyword: 'lengths scale, angles do not',
      trap: 'Area scales as the square of the length factor, so doubling the side multiplies the area by four, not by two.'
    },
    {
      id: 'rg-4', scene: 'rigid', start: 52.5, end: 60,
      caption: 'Only a mirror reverses the figure, and that reversal cannot be undone by turning it in the plane.',
      detail: 'Translation, rotation and scaling all preserve orientation: three corners taken clockwise still read clockwise. A mirror reverses that order, and no amount of rotation restores it. This is why the mirror is the operation the whole section turns on.',
      narration: 'Only the mirror reverses the figure. Take three corners and read them clockwise: translation, rotation and scaling all leave that order alone. A mirror swaps it. And no turning in the plane ever puts it back.',
      keyword: 'only the mirror reverses',
      trap: 'A shape and its mirror image can have identical side lengths and identical angles. Orientation is the only thing that separates them.'
    },

    /* ---------------- scene 3: mirror ---------------- */
    {
      id: 'mi-1', scene: 'mirror', start: 60, end: 67.5,
      caption: 'Read three labelled corners clockwise. A rotation keeps that order; a mirror reverses it.',
      detail: 'Label three corners of the original A, B, C in clockwise order. In the rotated image the corresponding corners still read A, B, C clockwise. In the mirrored image they read A, C, B clockwise, or A, B, C anticlockwise. One test, one answer.',
      narration: 'Here is the test that settles almost every mirror question. Label three corners A, B, C going clockwise. A rotation keeps them clockwise. A mirror makes them anticlockwise. Read the order and you are done.',
      keyword: 'clockwise order',
      trap: 'Do not compare the pictures as wholes. Find three identifiable corners and compare their cyclic order.'
    },
    {
      id: 'mi-2', scene: 'mirror', start: 67.5, end: 75,
      caption: 'The L tetromino cannot be turned into its mirror image in the plane at all.',
      detail: 'The L tetromino is chiral: its mirror image is a different figure, and no rotation in the plane carries one to the other. A square is the opposite extreme — it is its own mirror image four times over. Whether a figure can be turned into its mirror image is exactly the question of whether it has a line of symmetry.',
      narration: 'The L tetromino cannot be turned into its mirror image in the plane. Not by one turn, not by any number. Its mirror image is a genuinely different figure. A square is the opposite case: it is its own mirror image, four times over.',
      keyword: 'chiral, no rotation will do it',
      trap: 'Chirality is not about looking asymmetric. The L tetromino has no symmetry at all, and that is precisely why its mirror is different.'
    },
    {
      id: 'mi-3', scene: 'mirror', start: 75, end: 82.5,
      caption: 'Eight operations keep a square in place: four rotations and four mirrors.',
      detail: 'The rotations are by zero, ninety, one hundred eighty and two hundred seventy degrees. The mirrors are across the vertical axis, the horizontal axis, and the two diagonals. Eight operations, closed under composition, forming the symmetry group of the square. The model composes every pair and checks the result is one of the eight.',
      narration: 'For a square there are exactly eight operations that leave it looking unchanged. Four rotations, counting the do-nothing turn, and four mirrors: vertical, horizontal, and the two diagonals. Compose any two and you land on one of the eight again.',
      keyword: 'four rotations, four mirrors',
      trap: 'The do-nothing rotation counts. Leaving it out gives seven and loses the closure that makes the counting work.'
    },
    {
      id: 'mi-4', scene: 'mirror', start: 82.5, end: 90,
      caption: 'Order matters: rotating then mirroring is not the same as mirroring then rotating.',
      detail: 'Take the point one step right of centre. Rotate a quarter turn, then mirror across the vertical axis, and it lands at the top-left. Mirror first, then rotate, and it lands back where it started. The two composites disagree on a single point, which is enough to show they are different operations.',
      narration: 'And order matters. Take a point one step to the right of centre. Rotate, then mirror, and it ends at the top left. Mirror first, then rotate, and it comes back to where it started. Same two moves, different order, different answer.',
      keyword: 'order matters',
      trap: 'A question that says "first rotated, then mirrored" is not the same question as "first mirrored, then rotated". Read the order in the sentence.'
    },

    /* ---------------- scene 4: symmetry ---------------- */
    {
      id: 'sy-1', scene: 'symmetry', start: 90, end: 97.5,
      caption: 'A line of symmetry folds the figure onto itself. A rotational order counts turns that do the same.',
      detail: 'A line of symmetry is a mirror line such that the reflected figure equals the original. The rotational order is the number of rotations, including the do-nothing turn, that map the figure onto itself. Both are counted, not judged.',
      narration: 'Two counts do all the work here. A line of symmetry folds the figure exactly onto itself. The rotational order counts the turns that leave it looking the same, and the do-nothing turn is one of them.',
      keyword: 'count, do not judge',
      trap: 'A diagonal line only counts when the figure really is symmetric about that diagonal. A square has both diagonals; a rectangle has neither.'
    },
    {
      id: 'sy-2', scene: 'symmetry', start: 97.5, end: 105,
      caption: 'The square has four lines and rotational order four. The rectangle has two lines and order two.',
      detail: 'For the square the four lines are vertical, horizontal and the two diagonals, and the rotational orders are one, two, four and four. For a non-square rectangle only the vertical and horizontal lines work, because a diagonal reflection turns the rectangle sideways and it no longer matches.',
      narration: 'The square gives four lines and order four. A rectangle that is not a square gives two lines and order two, because its diagonals are not mirror lines: reflecting across a diagonal lays the rectangle on its side.',
      keyword: 'four and four, two and two',
      trap: 'The diagonals of a non-square rectangle are the classic wrong answer. They are not mirror lines.'
    },
    {
      id: 'sy-3', scene: 'symmetry', start: 105, end: 112.5,
      caption: 'The T tetromino has one line; the L tetromino has none, because it is chiral.',
      detail: 'The T tetromino is symmetric about its vertical axis only: one line, and no non-trivial rotation. The L tetromino has no mirror line and no non-trivial rotation at all. Its symmetry group is the single do-nothing operation, which is why its mirror image is a different figure.',
      narration: 'The T tetromino has one line of symmetry, down the middle. The L tetromino has none, and no turn either. Its only symmetry is doing nothing, and that is exactly why its mirror image is a different shape.',
      keyword: 'one line, or none',
      trap: 'A figure with no symmetry is not "hard", it is simply chiral. That is a fact about it, and questions use it.'
    },
    {
      id: 'sy-4', scene: 'symmetry', start: 112.5, end: 120,
      caption: 'The check: lines plus rotational order equals the size of the symmetry group, and that size divides eight.',
      detail: 'The eight operations of the square are partitioned by which of them fix the figure. The number that fix it is the sum of the number of mirror lines and the number of rotations that work, counting the do-nothing turn once in each count and so subtracting nothing: a figure with L lines and rotational order R has L plus R operations fixing it. The model computes L and R for each shape and compares the sum with an independent count of the eight operations that map the shape onto itself.',
      narration: 'And there is a check you can run. Count the mirror lines, count the rotational order, add them, and you have the number of the eight operations that leave the figure alone. The model counts both ways and compares.',
      keyword: 'lines plus order',
      trap: 'Adding the two counts double-counts nothing, because a reflection is never a rotation. Adding them is correct; subtracting one is not.'
    },

    /* ---------------- scene 5: fold ---------------- */
    {
      id: 'fo-1', scene: 'fold', start: 120, end: 127.5,
      caption: 'Each fold halves one dimension and doubles the number of layers.',
      detail: 'A fold along a line of symmetry brings one half of the sheet onto the other. The visible rectangle loses one dimension by half; the paper itself is unchanged, so the layer count doubles. After k folds there are two to the k layers and the apparent area is the original divided by two to the k.',
      narration: 'A fold brings half the sheet onto the other half. The visible rectangle halves in one direction, and the number of layers doubles. After three folds there are eight layers.',
      keyword: 'halve the size, double the layers',
      trap: 'The area of paper never changes. Only the apparent, visible area changes, and it divides by two for every fold.'
    },
    {
      id: 'fo-2', scene: 'fold', start: 127.5, end: 135,
      caption: 'A 20 by 8 sheet folded three times perpendicular to its long edge gives 10 by 8, then 5 by 8, then 5 by 4.',
      detail: 'The first fold halves the 20, leaving 10 by 8. The long edge is now 10, so the second fold halves it to 5 by 8. Now the 8 is the longer side, so the third fold halves the 8, giving 5 by 4. This is GATE CSE 2024 Set 1 GA Question 9, and the answer asked for there is the perimeter of the final sheet.',
      narration: 'Twenty by eight. The long edge is twenty, so the first fold gives ten by eight. The long edge is now ten, so the second gives five by eight. Now eight is the long edge, so the third fold halves it: five by four.',
      keyword: 're-find the long edge',
      trap: 'The phrase "perpendicular to its long edge" means the long edge is found again after every fold. It is not the same edge three times.'
    },
    {
      id: 'fo-3', scene: 'fold', start: 135, end: 142.5,
      caption: 'The perimeter of the folded sheet is 18 centimetres, and the wrong answer is 21.',
      detail: 'The final rectangle is 5 by 4, so its perimeter is two times the sum, which is 18. Folding the 20 side three times instead gives 2.5 by 8, whose perimeter is 21 — and 21 is offered as an option in that paper. The trap is worth four marks of care for two marks of question.',
      narration: 'The final sheet is five by four, so the perimeter is eighteen. Fold the twenty side three times instead and you get two and a half by eight, perimeter twenty-one, which is exactly the wrong option sitting there in the paper.',
      keyword: '18, not 21',
      trap: 'Both numbers are in the options. The difference is one phrase: perpendicular to its long edge.'
    },
    {
      id: 'fo-4', scene: 'fold', start: 142.5, end: 150,
      caption: 'The check on any fold sequence: original area equals final area times the layer count.',
      detail: 'Twenty times eight is one hundred sixty. Five times four is twenty, and eight layers of twenty is one hundred sixty. Any fold sequence whose numbers fail this check has been mis-tracked, and the model refuses the step.',
      narration: 'One check catches every folding slip. Original area equals final area times the layers. Twenty times eight is a hundred and sixty. Five times four, times eight layers, is a hundred and sixty. It agrees, so the tracking was right.',
      keyword: 'area times layers',
      trap: 'This check catches a lost fold but not a wrong edge. Do both: the area check and the long-edge rule.'
    },

    /* ---------------- scene 6: cut ---------------- */
    {
      id: 'cu-1', scene: 'cut', start: 150, end: 157.5,
      caption: 'One punch goes through every layer, so holes equal punches times layers.',
      detail: 'A cut or a punch removes material from the whole stack at once. If the stack has L layers, one punch produces L holes in the unfolded sheet, one per layer, provided the punch does not fall on a fold line where two layers share an edge.',
      narration: 'A punch goes through the whole stack. If there are four layers, one punch makes four holes. Holes equals punches times layers, and that single multiplication answers most of these questions.',
      keyword: 'punches times layers',
      trap: 'A punch exactly on a fold line is shared by two layers, so it makes fewer holes than the multiplication suggests.'
    },
    {
      id: 'cu-2', scene: 'cut', start: 157.5, end: 165,
      caption: 'A 4 by 4 sheet folded in half twice has four layers, so one punch makes four holes.',
      detail: 'Fold left onto right, then bottom onto top. The visible square is 2 by 2 and the stack is four layers thick. The model tracks every one of the sixteen original cells as a stack of layer indices, and checks that all sixteen appear exactly once after folding.',
      narration: 'A four by four sheet, folded in half one way and then the other, is a two by two stack four layers thick. One punch, and the unfolded sheet carries four holes.',
      keyword: 'four layers, four holes',
      trap: 'The visible square has four cells and the punch goes in one of them, which is why it is easy to think the answer is one.'
    },
    {
      id: 'cu-3', scene: 'cut', start: 165, end: 172.5,
      caption: 'Unfold in the reverse order, reflecting the holes across each fold line as you go.',
      detail: 'The last fold made is the first undone. Each unfolding reflects the current hole set across the fold line just opened. After all the reflections the holes are the original punches pushed out through the whole sheet.',
      narration: 'To find where the holes are, unfold in the reverse order. Each time you open a fold, reflect the holes across the line you just opened. The last fold made is the first one undone.',
      keyword: 'reverse order, reflect each time',
      trap: 'Unfolding in the same order as folding gives a pattern that is plausible and wrong. Reverse the order.'
    },
    {
      id: 'cu-4', scene: 'cut', start: 172.5, end: 180,
      caption: 'The four holes are symmetric about both fold lines, which is why the pattern looks regular.',
      detail: 'The hole set is closed under both reflections, so it is invariant under the group they generate. For two perpendicular folds that group has four elements, which is exactly why four holes appear and why they sit at the corners of a rectangle centred on the fold intersection.',
      narration: 'The four holes come out symmetric about both fold lines. That is not a coincidence: the holes must be closed under every reflection the folds used. Two perpendicular folds generate four positions, so four holes.',
      keyword: 'closed under the reflections',
      trap: 'If the number of holes is not a multiple of the layers, a punch landed on a fold line or the fold sequence was mis-tracked.'
    },

    /* ---------------- scene 7: net ---------------- */
    {
      id: 'ne-1', scene: 'net', start: 180, end: 187.5,
      caption: 'A net is a flat arrangement of six squares that folds into a cube. There are exactly eleven.',
      detail: 'Six squares joined edge to edge form a hexomino. Only some hexominoes fold up into a cube without overlap. The count of eleven is a classical result and the model reproduces it by construction rather than by citation.',
      narration: 'A net is six squares joined edge to edge that fold up into a cube. There are exactly eleven arrangements that work, and that number is small enough to check by machine.',
      keyword: 'eleven nets',
      trap: 'A net with six squares is not automatically a cube. Most hexominoes overlap themselves when folded.'
    },
    {
      id: 'ne-2', scene: 'net', start: 187.5, end: 195,
      caption: 'Thirty-five free hexominoes exist, and the model rolls a cube across each one: eleven close up.',
      detail: 'There are thirty-five free hexominoes up to rotation and reflection. The model grows every fixed hexomino from a single cell, reduces each to a canonical free form, then rolls a cube over the cells of each one and asks whether the six cells receive six different faces. Exactly eleven do.',
      narration: 'There are thirty-five free hexominoes. The model builds them all, then rolls a cube across each one and asks whether the six squares land on six different faces. Eleven of the thirty-five do.',
      keyword: '35 in, 11 out',
      trap: 'Thirty-five and eleven are different questions. Thirty-five counts shapes; eleven counts foldable shapes.'
    },
    {
      id: 'ne-3', scene: 'net', start: 195, end: 202.5,
      caption: 'Two faces are opposite exactly when they are two steps apart in a straight line.',
      detail: 'Rolling the cube along a straight run of squares puts successive squares on successive side faces, so squares one step apart are adjacent faces and squares two steps apart are opposite faces. Four squares in a row therefore give two opposite pairs, and the remaining two squares are the last opposite pair.',
      narration: 'Here is the rule that avoids folding anything. In a straight line of squares, two steps apart means opposite faces. One step apart means adjacent. So four squares in a row give two opposite pairs straight away.',
      keyword: 'two steps apart',
      trap: 'The rule needs a straight line. Squares that are two steps apart around a corner are not opposite.'
    },
    {
      id: 'ne-4', scene: 'net', start: 202.5, end: 210,
      caption: 'Opposite faces can never be adjacent, so they can never both be visible in one view.',
      detail: 'Any view of a cube shows three mutually adjacent faces. Two opposite faces cannot both appear. That single sentence eliminates most wrong options in a cube-view question, without deciding which cube the net actually makes.',
      narration: 'And the consequence that earns the mark: opposite faces are never adjacent, so a single view of a cube can never show both. Look at the option, find two faces that are opposite in the net, and if both are visible, delete the option.',
      keyword: 'never both visible',
      trap: 'This eliminates wrong options but does not confirm the right one. Use it first, then check the remaining candidate.'
    },

    /* ---------------- scene 8: cuts3d ---------------- */
    {
      id: 'c3-1', scene: 'cuts3d', start: 210, end: 217.5,
      caption: 'One straight cut through a block adds one piece. Three cuts, one along each axis, give eight.',
      detail: 'A plane cut that crosses the whole block splits every piece it passes through. Cutting once across each of the three axes divides the block into two along each axis, so the piece count is two cubed.',
      narration: 'One straight cut through a block splits it. Cut once across each of the three axes and you have two along each axis, which is eight pieces from three cuts.',
      keyword: 'two cubed',
      trap: 'The number of pieces is not the number of cuts. Three cuts give eight pieces because they multiply.'
    },
    {
      id: 'c3-2', scene: 'cuts3d', start: 217.5, end: 225,
      caption: 'With c-x cuts across one axis, the pieces number the product of the three counts plus one.',
      detail: 'If you make c-x cuts across the first axis, the block is divided into c-x plus one slabs in that direction. Independently across the other two axes gives the product. The model enumerates every split of a small number of cuts and confirms the maximum.',
      narration: 'In general, if you make c-x cuts across one axis you get c-x plus one slabs. Do the same on the other two axes and multiply. The pieces are the product of the three counts each plus one.',
      keyword: 'product of counts plus one',
      trap: 'The formula needs each cut to cross the whole block. A cut that stops halfway adds fewer pieces.'
    },
    {
      id: 'c3-3', scene: 'cuts3d', start: 225, end: 232.5,
      caption: 'Eight equal pieces therefore need exactly three cuts, not four.',
      detail: 'The model searches every distribution of one, two and three cuts across the three axes and reports the largest number of pieces each total can produce: two, four and eight. So eight equal pieces need three cuts, one per axis, and no arrangement of two cuts reaches eight. This is the shape of GATE CSE 2024 Set 2 GA Question 9.',
      narration: 'So eight equal pieces need three cuts, one along each axis. Two cuts reach at most four pieces, and no clever placement beats that, because the product is what counts.',
      keyword: 'three cuts, not four',
      trap: 'The options usually include four. Four cuts can give twelve pieces, so four is not the minimum.'
    },
    {
      id: 'c3-4', scene: 'cuts3d', start: 232.5, end: 240,
      caption: 'The trap is counting cuts as pieces, or pieces as cuts.',
      detail: 'Two related quantities are asked: the pieces produced by a given number of cuts, and the cuts needed for a given number of pieces. The first is a product, the second is a search over factorisations. Reading which one is asked is the whole question.',
      narration: 'The trap is that two different things get asked with almost the same words. How many pieces from these cuts is a product. How many cuts for these pieces is a search. Read which one you have been given.',
      keyword: 'product, or search',
      trap: 'Pieces that are not a product of three integers each at least two cannot be made with whole-axis cuts at all.'
    },

    /* ---------------- scene 9: tiling ---------------- */
    {
      id: 'ti-1', scene: 'tiling', start: 240, end: 247.5,
      caption: 'A tiling question is an arithmetic question. The first test is area.',
      detail: 'A tiling by copies of one tile needs the area of the region to be a multiple of the area of the tile. This is necessary and almost never sufficient, but it removes whole families of options in one division.',
      narration: 'A tiling question looks like geometry and is arithmetic. The first test is area: the region must divide by the tile. One division removes half the options.',
      keyword: 'area must divide',
      trap: 'Area divisibility is necessary, not sufficient. Passing it proves nothing; failing it proves impossibility.'
    },
    {
      id: 'ti-2', scene: 'tiling', start: 247.5, end: 255,
      caption: 'The second test is colour: shade the board like a chessboard and count each colour.',
      detail: 'Colouring alternate squares black and white turns a geometric obstruction into an arithmetic one. Any tile that covers a fixed number of black and white squares imposes an equation on the counts. If the region violates it, no arrangement of tiles can work.',
      narration: 'The second test is colour. Shade the board like a chessboard and count the two colours. Each tile covers a fixed number of each, so the counts have to agree.',
      keyword: 'colour and count',
      trap: 'The colouring must be chosen to suit the tile. The chessboard suits dominoes; other tiles need other colourings.'
    },
    {
      id: 'ti-3', scene: 'tiling', start: 255, end: 262.5,
      caption: 'A domino covers one black and one white square, so unequal counts mean no tiling exists.',
      detail: 'A one by two domino always covers one square of each colour, whatever its position and orientation. So a region tiled by dominoes must have equal numbers of the two colours. This is an invariant: it does not depend on how cleverly you place the tiles.',
      narration: 'A domino always covers one black square and one white one, wherever you put it. So a region tiled by dominoes must have the two colours in equal numbers. That is a fact about the region, not about your skill.',
      keyword: 'one black, one white',
      trap: 'This is an invariant, so it gives impossibility proofs only. Equal counts do not guarantee that a tiling exists.'
    },
    {
      id: 'ti-4', scene: 'tiling', start: 262.5, end: 270,
      caption: 'Remove two opposite corners of an 8 by 8 board and the counts are 30 and 32: impossible.',
      detail: 'The full board has thirty-two of each colour. Two opposite corners are the same colour, so removing them leaves thirty of that colour and thirty-two of the other. Sixty-two squares is divisible by two, so the area test passes and the colour test fails — which is exactly why both tests are needed.',
      narration: 'Take an eight by eight board, thirty-two of each colour, and remove two opposite corners. Both corners are the same colour, so you are left with thirty and thirty-two. The area still divides by two. The colours do not match. Impossible.',
      keyword: '30 and 32',
      trap: 'Removing two adjacent corners gives 31 and 31, which passes this test. The obstruction is specific to opposite corners.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr-1', scene: 'procedure', start: 270, end: 276,
      caption: 'Step one: name the operation from the wording of the question.',
      detail: 'The wording tells you the family. "Folded", "unfolded", "cut" are folding questions. "Minimum number of cuts", "pieces" are partition questions. "Which of these can be constructed" is tiling. "Line of symmetry" is a symmetry count.',
      narration: 'Step one is naming the family from the words of the question. Folded means reflections. Cuts and pieces mean products. Constructed means tiling. Symmetry means a count.',
      keyword: 'name the family',
      trap: 'A question can mix families. "A folded sheet is cut and unfolded" is folding first, then reflections.'
    },
    {
      id: 'pr-2', scene: 'procedure', start: 276, end: 282,
      caption: 'Step two: test orientation with three labelled corners before comparing anything else.',
      detail: 'Take three identifiable corners and read them clockwise. Preserved order means a rotation or a translation. Reversed order means a mirror. This is faster and more reliable than comparing the figures as wholes.',
      narration: 'Step two is the orientation test. Three labelled corners, read clockwise. Same order means rotation or slide. Reversed means mirror. Do this before comparing anything else.',
      keyword: 'three corners, clockwise',
      trap: 'Compare corners, not areas. Two figures of equal area can differ by orientation alone.'
    },
    {
      id: 'pr-3', scene: 'procedure', start: 282, end: 288,
      caption: 'Step three: for a folding question, halve one dimension, double the layers, and find the long edge again.',
      detail: 'Track three numbers through the sequence: the two dimensions and the layer count. After each fold, halve the dimension perpendicular to the fold line, double the layers, and re-identify the long edge. Check at the end that the original area equals the final area times the layers.',
      narration: 'Step three is folding. Keep three numbers: two dimensions and the layers. Halve the one the fold crosses, double the layers, and find the long edge again. Then check the area against the layers.',
      keyword: 'dimensions and layers',
      trap: 'Without re-finding the long edge, every fold after the first is applied to the wrong side.'
    },
    {
      id: 'pr-4', scene: 'procedure', start: 288, end: 294,
      caption: 'Step four: for cuts, multiply layers by punches, or use the product formula in three dimensions.',
      detail: 'In two dimensions a punch through a stack of L layers makes L holes, unless it lands on a fold line. In three dimensions c-x, c-y and c-z cuts across the three axes give the product of each count plus one pieces. For a required number of pieces, search the factorisations.',
      narration: 'Step four is cuts. In the plane, layers times punches. In space, the product of the three counts each plus one. And if the number of pieces is given, search the factorisations instead of guessing.',
      keyword: 'layers times punches',
      trap: 'A punch on a fold line is shared by two layers and breaks the multiplication.'
    },
    {
      id: 'pr-5', scene: 'procedure', start: 294, end: 300,
      caption: 'Step five: for tiling, check area and then colour. Two numbers settle it.',
      detail: 'Divide the region area by the tile area; a remainder ends the question. Then count the two colours under a colouring suited to the tile. For a domino, unequal counts end the question. Both tests give impossibility; a construction is needed to prove possibility.',
      narration: 'Step five is tiling: area first, then colour. Two numbers, and most of these questions are over. Remember that both tests can only prove impossibility. To prove it can be done you still have to draw it.',
      keyword: 'area, then colour',
      trap: 'A passing test is not a proof. Only a construction proves that a tiling exists.'
    }
  ]
};
