'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  CATEGORY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  type FormInput,
} from '@ab-predictor/shared';

const STORAGE_KEY = 'ab-predictor-form';

const INITIAL_STATE: FormInput = {
  productName: '',
  productDescription: '',
  productCategory: '',
  targetAudience: '',
  companySize: '',
  competitors: '',
  pricingModel: '',
  headlineA: '',
  supportingCopyA: '',
  approachLabelA: '',
  headlineB: '',
  supportingCopyB: '',
  approachLabelB: '',
  email: '',
  name: '',
};

type ValidationErrors = Partial<Record<keyof FormInput, string>>;

function validate(form: FormInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!form.productName.trim()) errors.productName = 'Product name is required';
  else if (form.productName.length > 100) errors.productName = 'Max 100 characters';

  if (!form.productDescription.trim()) errors.productDescription = 'Description is required';
  else if (form.productDescription.length < 20) errors.productDescription = 'At least 20 characters';
  else if (form.productDescription.length > 500) errors.productDescription = 'Max 500 characters';

  if (!form.productCategory.trim()) errors.productCategory = 'Category is required';

  if (!form.targetAudience.trim()) errors.targetAudience = 'Target audience is required';
  else if (form.targetAudience.length < 20) errors.targetAudience = 'At least 20 characters';
  else if (form.targetAudience.length > 300) errors.targetAudience = 'Max 300 characters';

  if (!form.companySize) errors.companySize = 'Company size is required';

  if (!form.competitors.trim()) errors.competitors = 'Competitors are required';
  else if (form.competitors.length < 5) errors.competitors = 'At least 5 characters';
  else if (form.competitors.length > 300) errors.competitors = 'Max 300 characters';

  if (form.pricingModel && form.pricingModel.length > 150) errors.pricingModel = 'Max 150 characters';

  if (!form.headlineA.trim()) errors.headlineA = 'Headline is required';
  else if (form.headlineA.length < 5) errors.headlineA = 'At least 5 characters';
  else if (form.headlineA.length > 100) errors.headlineA = 'Max 100 characters';

  if (form.supportingCopyA && form.supportingCopyA.length > 500) errors.supportingCopyA = 'Max 500 characters';
  if (form.approachLabelA && form.approachLabelA.length > 50) errors.approachLabelA = 'Max 50 characters';

  if (!form.headlineB.trim()) errors.headlineB = 'Headline is required';
  else if (form.headlineB.length < 5) errors.headlineB = 'At least 5 characters';
  else if (form.headlineB.length > 100) errors.headlineB = 'Max 100 characters';

  if (form.supportingCopyB && form.supportingCopyB.length > 500) errors.supportingCopyB = 'Max 500 characters';
  if (form.approachLabelB && form.approachLabelB.length > 50) errors.approachLabelB = 'Max 50 characters';

  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email';

  if (form.name && form.name.length > 100) errors.name = 'Max 100 characters';

  return errors;
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-error text-[11px] mt-1">{error}</p>;
}

function CharCount({ current, max }: { current: number; max: number }) {
  return (
    <span className="absolute bottom-3 right-3 mono-label text-[10px] text-outline/50">
      {current}/{max}
    </span>
  );
}

export default function InputForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormInput>(INITIAL_STATE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const formLoaded = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
    formLoaded.current = true;
  }, []);

  // Autosave to localStorage on change (debounced)
  useEffect(() => {
    if (!formLoaded.current) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [form]);

  const update = useCallback(
    (field: keyof FormInput, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => new Set(prev).add(field));
    },
    []
  );

  const handleBlur = useCallback(
    (field: keyof FormInput) => {
      setTouched((prev) => new Set(prev).add(field));
      setErrors((prev) => {
        const all = validate(form);
        return { ...prev, [field]: all[field] };
      });
    },
    [form]
  );

  const showCopyHint =
    (form.supportingCopyA && !form.supportingCopyB) ||
    (!form.supportingCopyA && form.supportingCopyB);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allErrors = validate(form);
    setErrors(allErrors);
    setTouched(new Set(Object.keys(form)));

    if (Object.keys(allErrors).length > 0) return;

    setSubmitting(true);
    setToast(null);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || 'Something went wrong');
        setSubmitting(false);
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/status/${data.jobId}`);
    } catch {
      setToast('Network error — please try again');
      setSubmitting(false);
    }
  }

  const fieldErr = (field: keyof FormInput) =>
    touched.has(field) ? errors[field] : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-error-container text-on-error-container px-6 py-3 rounded-xl text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}

      {/* ===== SECTION 1: Your Product ===== */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4 opacity-70">
          <span className="material-symbols-outlined text-sm">inventory_2</span>
          <h2 className="mono-label text-[11px] uppercase tracking-[0.2em] font-bold">
            Your Product
          </h2>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product name */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Product name
              </label>
              <input
                type="text"
                className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40"
                placeholder="e.g., Gong, Notion, Loom"
                value={form.productName}
                onChange={(e) => update('productName', e.target.value)}
                onBlur={() => handleBlur('productName')}
                maxLength={100}
              />
              <FieldError error={fieldErr('productName')} />
            </div>

            {/* Product category */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Product category
              </label>
              <select
                className="w-full bg-surface-container border-none rounded-lg p-3 text-sm text-on-surface-variant"
                value={isOtherCategory ? 'Other' : form.productCategory}
                onChange={(e) => {
                  if (e.target.value === 'Other') {
                    setIsOtherCategory(true);
                    update('productCategory', '');
                  } else {
                    setIsOtherCategory(false);
                    update('productCategory', e.target.value);
                  }
                }}
                onBlur={() => handleBlur('productCategory')}
              >
                <option value="">Select a category</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {isOtherCategory && (
                <input
                  type="text"
                  className="w-full bg-surface-container border-none rounded-lg p-3 text-sm text-on-surface-variant mt-2"
                  placeholder="Enter your product category"
                  value={form.productCategory}
                  onChange={(e) => update('productCategory', e.target.value)}
                  onBlur={() => handleBlur('productCategory')}
                  autoFocus
                />
              )}
              <FieldError error={fieldErr('productCategory')} />
            </div>

            {/* Product description */}
            <div className="md:col-span-2 space-y-2 relative">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                What does your product do?
              </label>
              <textarea
                className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40 pr-16"
                placeholder="Describe your product in 2-3 sentences. What problem does it solve? Who is it for?"
                rows={3}
                value={form.productDescription}
                onChange={(e) => update('productDescription', e.target.value)}
                onBlur={() => handleBlur('productDescription')}
                maxLength={500}
              />
              <CharCount current={form.productDescription.length} max={500} />
              <p className="text-[10px] text-outline/60 mt-1 italic">
                Be specific — &apos;AI-powered sales call analytics for B2B sales teams&apos; is better than &apos;a tool for sales&apos;
              </p>
              <FieldError error={fieldErr('productDescription')} />
            </div>

            {/* Target audience */}
            <div className="space-y-2 relative">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Who buys this product?
              </label>
              <textarea
                className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40 pr-16"
                placeholder="e.g., VP of Sales at mid-market SaaS companies (200-2000 employees), frustrated with manual call reviews"
                rows={2}
                value={form.targetAudience}
                onChange={(e) => update('targetAudience', e.target.value)}
                onBlur={() => handleBlur('targetAudience')}
                maxLength={300}
              />
              <CharCount current={form.targetAudience.length} max={300} />
              <FieldError error={fieldErr('targetAudience')} />
            </div>

            {/* Company size */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Target company size
              </label>
              <select
                className="w-full bg-surface-container border-none rounded-lg p-3 text-sm text-on-surface-variant"
                value={form.companySize}
                onChange={(e) => update('companySize', e.target.value)}
                onBlur={() => handleBlur('companySize')}
              >
                <option value="">Select a size</option>
                {COMPANY_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <FieldError error={fieldErr('companySize')} />
            </div>

            {/* Competitors */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Top 2-3 competitors
              </label>
              <input
                type="text"
                className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40"
                placeholder="e.g., Chorus.ai, Clari, manual spreadsheet tracking"
                value={form.competitors}
                onChange={(e) => update('competitors', e.target.value)}
                onBlur={() => handleBlur('competitors')}
                maxLength={300}
              />
              <p className="text-[10px] text-outline/60 mt-1 italic">
                Include both direct competitors and the status quo (manual process)
              </p>
              <FieldError error={fieldErr('competitors')} />
            </div>

            {/* Pricing model */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Pricing model (optional)
              </label>
              <input
                type="text"
                className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40"
                placeholder="e.g., $100/user/month, freemium with enterprise tier"
                value={form.pricingModel}
                onChange={(e) => update('pricingModel', e.target.value)}
                maxLength={150}
              />
              <FieldError error={fieldErr('pricingModel')} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: Messages to Test ===== */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4 opacity-70">
          <span className="material-symbols-outlined text-sm">compare_arrows</span>
          <h2 className="mono-label text-[11px] uppercase tracking-[0.2em] font-bold">
            Messages to Test
          </h2>
        </div>

        {showCopyHint && (
          <p className="text-[11px] text-on-surface-variant/70 italic mb-4 px-1">
            Tip: leave supporting copy the same on both sides to isolate the headline difference
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A */}
          <div className="bg-surface-container-low border-l-2 border-primary border-t border-r border-b border-t-outline-variant/15 border-r-outline-variant/15 border-b-outline-variant/15 p-8 rounded-xl">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                Message A
              </span>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Headline / tagline
                </label>
                <input
                  type="text"
                  className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40"
                  placeholder="The line that stops the scroll"
                  value={form.headlineA}
                  onChange={(e) => update('headlineA', e.target.value)}
                  onBlur={() => handleBlur('headlineA')}
                  maxLength={100}
                />
                <FieldError error={fieldErr('headlineA')} />
              </div>
              <div className="space-y-2 relative">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Supporting copy
                </label>
                <textarea
                  className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40 pr-16"
                  placeholder="The paragraph below your headline — the fuller value prop or elevator pitch. If left blank, agents react to the headline alone."
                  rows={3}
                  value={form.supportingCopyA}
                  onChange={(e) => update('supportingCopyA', e.target.value)}
                  maxLength={500}
                />
                <CharCount current={form.supportingCopyA?.length ?? 0} max={500} />
                <FieldError error={fieldErr('supportingCopyA')} />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Approach label
                </label>
                <input
                  type="text"
                  className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40"
                  placeholder="e.g., Value-led, Outcome-focused"
                  value={form.approachLabelA}
                  onChange={(e) => update('approachLabelA', e.target.value)}
                  maxLength={50}
                />
                <FieldError error={fieldErr('approachLabelA')} />
              </div>
            </div>
          </div>

          {/* Card B */}
          <div className="bg-surface-container-low border-l-2 border-secondary border-t border-r border-b border-t-outline-variant/15 border-r-outline-variant/15 border-b-outline-variant/15 p-8 rounded-xl">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                Message B
              </span>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Headline / tagline
                </label>
                <input
                  type="text"
                  className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40"
                  placeholder="Your alternative — make it meaningfully different from A"
                  value={form.headlineB}
                  onChange={(e) => update('headlineB', e.target.value)}
                  onBlur={() => handleBlur('headlineB')}
                  maxLength={100}
                />
                <FieldError error={fieldErr('headlineB')} />
              </div>
              <div className="space-y-2 relative">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Supporting copy
                </label>
                <textarea
                  className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40 pr-16"
                  placeholder="The paragraph below your headline — the fuller value prop or elevator pitch. If left blank, agents react to the headline alone."
                  rows={3}
                  value={form.supportingCopyB}
                  onChange={(e) => update('supportingCopyB', e.target.value)}
                  maxLength={500}
                />
                <CharCount current={form.supportingCopyB?.length ?? 0} max={500} />
                <FieldError error={fieldErr('supportingCopyB')} />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Approach label
                </label>
                <input
                  type="text"
                  className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40"
                  placeholder="e.g., Feature-led, Tech-focused"
                  value={form.approachLabelB}
                  onChange={(e) => update('approachLabelB', e.target.value)}
                  maxLength={50}
                />
                <FieldError error={fieldErr('approachLabelB')} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: Your Info ===== */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-4 opacity-70">
          <span className="material-symbols-outlined text-sm">person</span>
          <h2 className="mono-label text-[11px] uppercase tracking-[0.2em] font-bold">
            Your Info
          </h2>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-2/3 space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Email for results
              </label>
              <input
                type="email"
                className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                onBlur={() => handleBlur('email')}
              />
              <p className="text-[10px] text-outline/60 mt-1 italic">
                We&apos;ll email you when your simulation is complete (~20 min). No spam, ever.
              </p>
              <FieldError error={fieldErr('email')} />
            </div>
            <div className="w-full md:w-1/3 space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Your name (optional)
              </label>
              <input
                type="text"
                className="w-full bg-surface-container border-none rounded-lg p-3 text-sm placeholder:text-outline/40"
                placeholder="For the report header"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                maxLength={100}
              />
              <FieldError error={fieldErr('name')} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Submit ===== */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={submitting}
          className="bg-white text-surface hover:bg-on-background active:scale-95 transition-all duration-200 px-12 py-5 rounded-xl text-lg font-bold flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              Submitting...
              <svg
                className="animate-spin h-5 w-5 text-surface"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </>
          ) : (
            <>
              Run simulation
              <span className="material-symbols-outlined">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
