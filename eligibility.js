/**
 * Defence Track AI - Shared eligibility engine
 * One rule set used by both the Eligibility Matcher form and the AI chat analyzer.
 * Rules are a preliminary screen only; the official notification always prevails.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DefenceEligibility = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const GRAD = ['graduate_non_tech', 'graduate_tech', 'law', 'post_graduate'];

  // Minimum height in cm. null = varies by trade/state, so no hard cut-off is applied.
  const HEIGHT = {
    default: { male: 157.5, female: 152 },
    capf: { male: 165, female: 157 },
    agniveer_army: null,
    agniveer_navy: null,
    agniveer_airforce: null
  };

  function evaluate(careers, input) {
    const { gender, age, qualification, hasPCM, height } = input;
    const isGrad = GRAD.includes(qualification);
    const eligible = [];
    const restricted = [];

    careers.forEach((c) => {
      const reasons = [];
      const notes = [];
      const e = c.eligibility;

      if (!e.gender.includes(gender)) reasons.push(`Open to ${e.gender.join('/')} candidates only`);
      if (age < e.ageMin) reasons.push(`Minimum age is ${e.ageMin} (you entered ${age})`);
      else if (age > e.ageMax) reasons.push(`Maximum age is ${e.ageMax} (you entered ${age})`);

      switch (c.id) {
        case 'nda':
          if (!hasPCM) notes.push('Without Physics & Maths you can only join the Army wing');
          break;
        case 'cds':
          if (!isGrad) reasons.push('Requires a graduation degree (final-year students may apply)');
          if (gender === 'female') notes.push('Women can apply for OTA only');
          if (!hasPCM) notes.push('IMA / OTA only; INA and AFA need Physics & Maths at 10+2');
          break;
        case 'afcat':
          if (!isGrad) reasons.push('Requires a graduation degree (final-year students may apply)');
          if (!hasPCM) notes.push('Ground Duty (Non-Technical) only; Flying and Technical need Physics & Maths at 10+2');
          if (age > 24) notes.push('Flying branch upper age limit is 24');
          break;
        case 'ssc_tech':
        case 'tgc':
          if (qualification !== 'graduate_tech') reasons.push('Requires a B.E / B.Tech degree (final-year students may apply)');
          break;
        case 'jag':
          if (qualification !== 'law') reasons.push('Requires an LLB degree');
          break;
        case 'ncc_special':
          if (!isGrad) reasons.push('Requires a graduation degree');
          notes.push("Needs an NCC 'C' certificate with at least B grade");
          break;
        case 'capf':
          if (!isGrad) reasons.push('Requires a graduation degree');
          break;
        case 'agniveer_navy':
          if (!hasPCM) notes.push('SSR trades need Physics & Maths; MR trades need only Class 10');
          break;
        default:
          break;
      }

      if (height > 0) {
        const rule = Object.prototype.hasOwnProperty.call(HEIGHT, c.id) ? HEIGHT[c.id] : HEIGHT.default;
        if (rule && height < rule[gender]) {
          reasons.push(`Minimum height is ${rule[gender]} cm (relaxations exist for some regions and communities)`);
        } else if (c.id === 'afcat' && height < 162.5) {
          notes.push('Flying branch needs at least 162.5 cm');
        }
      }

      if (reasons.length) restricted.push({ career: c, reasons });
      else eligible.push({ career: c, notes });
    });

    return { eligible, restricted };
  }

  return { evaluate, GRAD };
});
