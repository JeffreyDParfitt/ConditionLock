import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { templates } from "@/templates";
import { storage } from "@/storage/actions";
import type { PacketType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

const baseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().optional(),
  companyOrPerson: z.string().optional(),
  referenceNumber: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  details: z.record(z.any()).optional(),
});

export default function NewPacketForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const type = (params.type as PacketType) || "custom";
  const template = templates[type];

  const form = useForm<z.infer<typeof baseSchema>>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      title: `${template?.name || "Custom"} Packet - ${new Intl.DateTimeFormat().format(new Date())}`,
      location: "",
      companyOrPerson: "",
      referenceNumber: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      notes: "",
      details: {},
    },
  });

  async function onSubmit(values: z.infer<typeof baseSchema>) {
    // Generate initial checklist from template
    const checklistItems = template?.sections.flatMap(section => 
      section.items.map(item => ({
        id: crypto.randomUUID(),
        packetId: "", // Will set later, but we create packet with it
        section: section.name,
        label: item.label,
        description: item.description,
        phase: item.phase,
        status: item.status,
        notes: "",
        photoIds: [],
        addedDuringInspection: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    ) || [];

    const id = await storage.createPacket({
      type,
      title: values.title,
      location: values.location || "",
      companyOrPerson: values.companyOrPerson || "",
      referenceNumber: values.referenceNumber || "",
      startDate: values.startDate || "",
      endDate: values.endDate || "",
      phase: "before",
      notes: values.notes || "",
      checklistItems,
      photos: [],
      communicationLogs: [],
      signatures: [],
      details: values.details || {},
    });

    // Fix packetId in checklist items
    await storage.updatePacket(id, {
      checklistItems: checklistItems.map(item => ({ ...item, packetId: id }))
    });

    setLocation(`/packets/${id}`);
  }

  if (!template) return <div>Template not found</div>;

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto min-h-[100dvh] px-4 pt-6 pb-24 space-y-6">
      <header className="flex items-center gap-3">
        <Link href="/packets/new">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight">New {template.name}</h1>
          <p className="text-xs text-muted-foreground">{template.description}</p>
        </div>
      </header>

      {type === 'accident_claim' && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive-foreground font-medium flex gap-2">
          <span className="text-destructive font-bold">⚠️</span>
          <span className="text-destructive">Only document the scene if it is safe to do so. Do not block traffic or place yourself in danger.</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Packet Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location / Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 123 Main St, Apt 4B" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyOrPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company or Person</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Hertz, John Doe" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referenceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference / Reservation #</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>General Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} className="resize-none" rows={3} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full mt-4 h-14 text-base">
            Create Packet
          </Button>
        </form>
      </Form>
    </div>
  );
}
