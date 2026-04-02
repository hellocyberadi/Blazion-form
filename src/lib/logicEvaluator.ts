import { Question, LogicRule, LogicCondition } from "@/types";

type AnswerMap = Record<string, any>;

export function evaluateCondition(cond: LogicCondition, answers: AnswerMap): boolean {
  let val = answers[cond.questionId];

  // If answer hasn't been provided yet, usually conditions aren't met unless looking for empty
  if (val === undefined || val === null) {
    return cond.operator === 'is_empty';
  }

  // Convert array values (like checkboxes/matrix) to string for contains checking, or array length check
  const isArray = Array.isArray(val);
  const strVal = isArray ? val.join(",") : String(val);
  const searchVal = String(cond.value || "");

  switch (cond.operator) {
    case 'equals':
      if (isArray) return val.includes(searchVal); // Or exact match? Usually equals on multiple choice means "contains this option"
      return String(val).toLowerCase() === searchVal.toLowerCase();
    case 'not_equals':
      if (isArray) return !val.includes(searchVal);
      return String(val).toLowerCase() !== searchVal.toLowerCase();
    case 'contains':
      return strVal.toLowerCase().includes(searchVal.toLowerCase());
    case 'is_empty':
      if (isArray) return val.length === 0;
      return strVal === "";
    case 'greater_than':
      return Number(val) > Number(searchVal);
    case 'less_than':
      return Number(val) < Number(searchVal);
    default:
      return false;
  }
}

export function evaluateRule(rule: LogicRule, answers: AnswerMap): boolean {
  if (rule.conditionType === 'any') {
    return rule.conditions.some(c => evaluateCondition(c, answers));
  } else {
    return rule.conditions.every(c => evaluateCondition(c, answers));
  }
}

export function evaluateFormLogic(allQuestions: Question[], answers: AnswerMap) {
  const requiresShowList = new Set<string>();
  const rulesMet = new Set<string>();
  
  // Step 1: Identify all rules that are met and all questions that have a "show" dependency
  allQuestions.forEach(q => {
    (q.logic || []).forEach(rule => {
      rule.actions.forEach(act => {
        if (act.type === 'show' && act.targetQuestionId) {
          requiresShowList.add(act.targetQuestionId);
        }
      });
      
      if (evaluateRule(rule, answers)) {
        rulesMet.add(rule.id);
      }
    });
  });

  // Step 2: Apply actions
  const metShowActions = new Set<string>();
  const hiddenQuestions = new Set<string>();
  let earlyEndFormIndex = -1;

  for (let i = 0; i < allQuestions.length; i++) {
    const q = allQuestions[i];
    
    // Check if any rule belonging to this question triggered an early end form
    (q.logic || []).forEach(rule => {
      if (rulesMet.has(rule.id)) {
        rule.actions.forEach(act => {
          if (act.type === 'show' && act.targetQuestionId) metShowActions.add(act.targetQuestionId);
          if (act.type === 'hide' && act.targetQuestionId) hiddenQuestions.add(act.targetQuestionId);
          if (act.type === 'end_form') {
            if (earlyEndFormIndex === -1 || i < earlyEndFormIndex) {
              earlyEndFormIndex = i;
            }
          }
        });
      }
    });
  }

  // Step 3: Determine visibility
  // A question is visible if:
  // - It comes before earlyEndFormIndex (if any)
  // - AND It is not explicitly hidden
  // - AND (It doesn't require a 'show' action OR its 'show' action was met)
  
  const visibleQuestionIds = new Set<string>();
  
  for (let i = 0; i < allQuestions.length; i++) {
    const q = allQuestions[i];
    
    if (earlyEndFormIndex !== -1 && i > earlyEndFormIndex) {
      // Hidden because of end_form triggered by a previous question
      continue;
    }

    if (hiddenQuestions.has(q.id)) {
      continue;
    }

    if (requiresShowList.has(q.id) && !metShowActions.has(q.id)) {
      continue;
    }

    visibleQuestionIds.add(q.id);
  }

  return { visibleQuestionIds };
}
