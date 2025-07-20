"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, LoaderCircle } from "lucide-react";

const formSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  description: z
    .string()
    .min(2, {
      message: "Description must be at least 2 characters.",
    })
    .max(100, {
      message: "Description must not exceed 100 characters.",
    }),
  category: z.string().min(1, { message: "Please select a category." }),
  date: z.date(),
});

type FormInputValues = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

const categories = {
  expense: ["Food", "Transport", "Entertainment", "Shopping", "Bills & Utilities", "Health", "Housing", "Other"],
  income: ["Salary", "Freelance", "Investment", "Gifts", "Business", "Rental Income", "Other"],
};

export type TransactionData = Omit<FormValues, 'amount'> & { amount: number | string; id?: string };

interface TransactionFormProps {
  transaction?: TransactionData;
  onSubmit: (values: FormValues) => Promise<void> | void;
  onCancel: () => void;
}

export default function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const isEditMode = !!transaction?.id;

  const form = useForm<FormInputValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: transaction
      ? {
          ...transaction,
          amount: transaction.amount?.toString() || "",
          date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date),
        }
      : {
          type: "expense",
          amount: "",
          description: "",
          category: "",
          date: new Date(),
        },
  });

  const { isSubmitting } = form.formState;
  const watchedType = form.watch("type");

  // Defensive: ensure date picker never goes undefined
  const handleDateChange = React.useCallback(
    (date: Date | undefined) => {
      if (date) {
        form.setValue("date", date, { shouldValidate: true });
      }
    },
    [form]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => {
        const parsed = formSchema.parse(data);
        onSubmit(parsed);
      })} className="bg-background">
        <div className="space-y-8 p-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormControl>
                  <Tabs
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value as "income" | "expense");
                      if (form.getValues("category")) {
                        form.setValue("category", "");
                      }
                    }}
                    className="w-[280px]"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="expense">Expense</TabsTrigger>
                      <TabsTrigger value="income">Income</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field: { onChange, ...fieldProps } }) => (
              <FormItem>
                <FormControl>
                  <div className="relative flex h-24 items-baseline justify-center gap-x-2">
                    <span className={cn("text-4xl font-medium", watchedType === "expense" ? "text-destructive" : "text-primary")}>{watchedType === "expense" ? "-" : "+"}</span>
                    <span className="text-4xl font-medium text-muted-foreground">Rp</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      {...fieldProps}
                      onChange={(e) => {
                        const { value } = e.target;
                        if (value === "" || value === undefined) {
                          onChange(undefined);
                        } else if (/^\d*\.?\d{0,2}$/.test(value)) {
                          onChange(value);
                        }
                      }}
                      value={fieldProps.value === undefined || fieldProps.value === null ? "" : String(fieldProps.value)}
                      className={cn(
                        "w-full max-w-[300px] border-none bg-transparent text-center text-7xl font-bold tracking-tighter shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                        watchedType === "expense" ? "text-destructive" : "text-primary"
                      )}
                    />
                  </div>
                </FormControl>
                <div className="h-5 text-center">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 md:px-0 lg:gap-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dinner with family" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories[watchedType].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value as Date} onSelect={handleDateChange} disabled={(date) => date > new Date() || date < new Date("2000-01-01")} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-x-2 pt-4 px-4 md:px-0">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Save Changes" : "Add Transaction"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
