import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import fetchMonitors from "@/features/monitors/api/fetch-monitors";
import type { MonitorResponse } from "@/features/monitors/schemas";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useCheckSlug } from "../api/use-check-slug";
import { useCreateStatusPage } from "../api/use-create-status-page";
import { createStatusPageSchema, type CreateStatusPage } from "../schemas";
import { generateSlug } from "../utils/generate-slug";

type MonitorWithConfig = {
  monitorId: number;
  name: string;
  groupId: string | null;
  displayName: string;
  displayOrder: number;
};

type Group = {
  tempId: string;
  label: string;
  displayOrder: number;
};

export default function StatusPageForm() {
  const { teamId } = useParams({
    from: "/(dashboard)/$teamId/status-pages/new",
  });
  const createMutation = useCreateStatusPage();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedMonitors, setSelectedMonitors] = useState<
    Map<number, MonitorWithConfig>
  >(new Map());
  const [newGroupLabel, setNewGroupLabel] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: monitors = [] } = useQuery({
    queryKey: ["monitors", teamId],
    queryFn: () => fetchMonitors(teamId),
  });

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isPublic: true,
      showHistoricalUptime: true,
    } as CreateStatusPage,
    validators: {
      onSubmit: createStatusPageSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = createStatusPageSchema.parse(value);
      const result = await createMutation.mutateAsync({
        teamId: Number(teamId),
        data: parsed,
      });

      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        await fetch(`/api/status-pages/${teamId}/${result.id}/logo`, {
          method: "POST",
          body: formData,
        });
      }

      for (const group of groups) {
        const groupResult = await fetch(
          `/api/status-pages/${teamId}/${result.id}/groups`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: group.label,
              displayOrder: group.displayOrder,
            }),
          },
        );
        const createdGroup = await groupResult.json();

        const monitorsInGroup = Array.from(selectedMonitors.values()).filter(
          (m) => m.groupId === group.tempId,
        );

        for (const monitor of monitorsInGroup) {
          await fetch(`/api/status-pages/${teamId}/${result.id}/monitors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              monitorId: monitor.monitorId,
              groupId: createdGroup.id,
              displayName: monitor.displayName || null,
              displayOrder: monitor.displayOrder,
            }),
          });
        }
      }

      const ungroupedMonitors = Array.from(selectedMonitors.values()).filter(
        (m) => m.groupId === null,
      );
      for (const monitor of ungroupedMonitors) {
        await fetch(`/api/status-pages/${teamId}/${result.id}/monitors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            monitorId: monitor.monitorId,
            groupId: null,
            displayName: monitor.displayName || null,
            displayOrder: monitor.displayOrder,
          }),
        });
      }
    },
  });

  const slugValue = form.state.values.slug;
  const { data: slugCheck } = useCheckSlug(
    teamId,
    slugValue,
    slugValue.length >= 3,
  );

  const logoPreview = useMemo(() => {
    if (!logoFile) return null;
    return URL.createObjectURL(logoFile);
  }, [logoFile]);

  const prevLogoPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    const prevUrl = prevLogoPreviewRef.current;
    if (prevUrl && prevUrl !== logoPreview) {
      URL.revokeObjectURL(prevUrl);
    }
    prevLogoPreviewRef.current = logoPreview;

    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
        toast.error("Only PNG, JPG, and SVG files are allowed");
        return;
      }
      setLogoFile(file);
    }
  };

  const addGroup = () => {
    if (!newGroupLabel.trim()) return;
    setGroups([
      ...groups,
      {
        tempId: `temp-${Date.now()}`,
        label: newGroupLabel,
        displayOrder: groups.length,
      },
    ]);
    setNewGroupLabel("");
  };

  const removeGroup = (tempId: string) => {
    const updatedGroups = groups.filter((g) => g.tempId !== tempId);
    updatedGroups.forEach((group, idx) => {
      group.displayOrder = idx;
    });
    setGroups(updatedGroups);

    const updated = new Map(selectedMonitors);
    updated.forEach((monitor, key) => {
      if (monitor.groupId === tempId) {
        updated.set(key, { ...monitor, groupId: null });
      }
    });
    recalculateDisplayOrders(updated, updatedGroups);
    setSelectedMonitors(updated);
  };

  const toggleMonitor = (monitor: MonitorResponse) => {
    const updated = new Map(selectedMonitors);
    if (updated.has(monitor.id)) {
      updated.delete(monitor.id);
    } else {
      const ungroupedMonitors = Array.from(updated.values()).filter(
        (m) => m.groupId === null,
      );
      updated.set(monitor.id, {
        monitorId: monitor.id,
        name: monitor.name,
        groupId: null,
        displayName: "",
        displayOrder: ungroupedMonitors.length,
      });
    }
    setSelectedMonitors(updated);
  };

  const updateMonitorGroup = (monitorId: number, groupId: string | null) => {
    const updated = new Map(selectedMonitors);
    const monitor = updated.get(monitorId);
    if (monitor) {
      updated.set(monitorId, { ...monitor, groupId });
      recalculateDisplayOrders(updated, groups);
    }
    setSelectedMonitors(updated);
  };

  const recalculateDisplayOrders = (
    monitorsMap: Map<number, MonitorWithConfig>,
    groupsList: Group[],
  ) => {
    const ungroupedMonitors = Array.from(monitorsMap.values())
      .filter((m) => m.groupId === null)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    ungroupedMonitors.forEach((monitor, index) => {
      const existing = monitorsMap.get(monitor.monitorId);
      if (existing) {
        monitorsMap.set(monitor.monitorId, {
          ...existing,
          displayOrder: index,
        });
      }
    });

    groupsList.forEach((group) => {
      const monitorsInGroup = Array.from(monitorsMap.values())
        .filter((m) => m.groupId === group.tempId)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      monitorsInGroup.forEach((monitor, index) => {
        const existing = monitorsMap.get(monitor.monitorId);
        if (existing) {
          monitorsMap.set(monitor.monitorId, {
            ...existing,
            displayOrder: index,
          });
        }
      });
    });
  };

  const moveGroup = (tempId: string, direction: "up" | "down") => {
    const index = groups.findIndex((g) => g.tempId === tempId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= groups.length) return;

    const updated = [...groups];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    updated.forEach((group, idx) => {
      group.displayOrder = idx;
    });

    setGroups(updated);
  };

  const moveMonitor = (
    monitorId: number,
    groupId: string | null,
    direction: "up" | "down",
  ) => {
    const updated = new Map(selectedMonitors);

    let monitors: MonitorWithConfig[];
    if (groupId === null) {
      monitors = Array.from(updated.values())
        .filter((m) => m.groupId === null)
        .sort((a, b) => a.displayOrder - b.displayOrder);
    } else {
      monitors = Array.from(updated.values())
        .filter((m) => m.groupId === groupId)
        .sort((a, b) => a.displayOrder - b.displayOrder);
    }

    const index = monitors.findIndex((m) => m.monitorId === monitorId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= monitors.length) return;

    const monitor1 = monitors[index];
    const monitor2 = monitors[newIndex];

    const tempOrder = monitor1.displayOrder;
    monitor1.displayOrder = monitor2.displayOrder;
    monitor2.displayOrder = tempOrder;

    updated.set(monitor1.monitorId, monitor1);
    updated.set(monitor2.monitorId, monitor2);

    setSelectedMonitors(updated);
  };

  const getGroupLabel = (groupId: string | null) => {
    if (!groupId) return "No Group";
    const group = groups.find((g) => g.tempId === groupId);
    return group?.label || "No Group";
  };

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-8"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="space-y-4">
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <Label htmlFor={field.name}>Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        if (!slugTouched) {
                          form.setFieldValue("slug", generateSlug(e.target.value));
                        }
                      }}
                      aria-invalid={isInvalid}
                      placeholder="Production Status"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Field
              name="slug"
              children={(field) => {
                const isInvalid =
                  (field.state.meta.isTouched && !field.state.meta.isValid) ||
                  (slugCheck && !slugCheck.available);
                return (
                  <Field data-invalid={isInvalid}>
                    <Label htmlFor={field.name}>Slug</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={() => {
                        field.handleBlur();
                        setSlugTouched(true);
                      }}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        setSlugTouched(true);
                      }}
                      aria-invalid={isInvalid}
                      placeholder="production-status"
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      /status/{field.state.value || "your-slug"}
                    </p>
                    {slugCheck && !slugCheck.available && (
                      <p className="text-sm text-destructive">
                        This slug is already in use
                      </p>
                    )}
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Field
              name="description"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <Label htmlFor={field.name}>Description (optional)</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Real-time status and uptime monitoring"
                      rows={3}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Logo</h3>
          <div className="space-y-4">
            {logoPreview && (
              <div className="flex items-center gap-4">
                <img src={logoPreview} alt="Logo preview" className="h-16" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLogoFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div>
              <Label htmlFor="logo">Upload Logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, or SVG. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Groups</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newGroupLabel}
                onChange={(e) => setNewGroupLabel(e.target.value)}
                placeholder="e.g., API, Frontend, Database"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addGroup();
                  }
                }}
              />
              <Button type="button" onClick={addGroup} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </div>
            {groups.length > 0 && (
              <div className="space-y-2">
                {groups
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((group, index) => (
                    <div
                      key={group.tempId}
                      className="flex items-center justify-between p-3 border"
                    >
                      <span className="font-medium">{group.label}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveGroup(group.tempId, "up")}
                          disabled={index === 0}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveGroup(group.tempId, "down")}
                          disabled={index === groups.length - 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGroup(group.tempId)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Monitors</h3>
          <div className="space-y-4">
            {monitors.map((monitor) => {
              const selected = selectedMonitors.get(monitor.id);
              const isSelected = !!selected;

              if (!isSelected) {
                return (
                  <div
                    key={monitor.id}
                    className="flex items-center gap-3 border p-3"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleMonitor(monitor)}
                    />
                    <span className="font-medium">{monitor.name}</span>
                  </div>
                );
              }

              const monitorsInSameGroup = Array.from(selectedMonitors.values())
                .filter(
                  (m) =>
                    m.groupId === selected.groupId &&
                    m.monitorId !== monitor.id,
                )
                .sort((a, b) => a.displayOrder - b.displayOrder);

              const allInGroup = selected.groupId
                ? [
                    ...monitorsInSameGroup,
                    selected,
                  ].sort((a, b) => a.displayOrder - b.displayOrder)
                : [
                    ...Array.from(selectedMonitors.values()).filter(
                      (m) => m.groupId === null,
                    ),
                  ].sort((a, b) => a.displayOrder - b.displayOrder);

              const currentIndex = allInGroup.findIndex(
                (m) => m.monitorId === monitor.id,
              );

              return (
                <div key={monitor.id} className="border p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleMonitor(monitor)}
                    />
                    <span className="font-medium flex-1">{monitor.name}</span>
                    {allInGroup.length > 1 && (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            moveMonitor(monitor.id, selected.groupId, "up")
                          }
                          disabled={currentIndex === 0}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            moveMonitor(monitor.id, selected.groupId, "down")
                          }
                          disabled={currentIndex === allInGroup.length - 1}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="ml-7 space-y-3">
                    <div>
                      <Label className="text-xs">Display Name (optional)</Label>
                      <Input
                        value={selected.displayName}
                        onChange={(e) => {
                          const updated = new Map(selectedMonitors);
                          updated.set(monitor.id, {
                            ...selected,
                            displayName: e.target.value,
                          });
                          setSelectedMonitors(updated);
                        }}
                        placeholder={monitor.name}
                        className="h-8 text-sm"
                      />
                    </div>
                    {groups.length > 0 && (
                      <div>
                        <Label className="text-xs">Group</Label>
                        <Select
                          value={selected.groupId || ""}
                          onValueChange={(value) =>
                            updateMonitorGroup(monitor.id, value || null)
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue>
                              {getGroupLabel(selected.groupId)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Group</SelectItem>
                            {groups
                              .sort((a, b) => a.displayOrder - b.displayOrder)
                              .map((g) => (
                                <SelectItem key={g.tempId} value={g.tempId}>
                                  {g.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Settings</h3>
          <div className="space-y-4">
            <form.Field
              name="isPublic"
              children={(field) => (
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Status Page</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anyone with the link to view this status page
                    </p>
                  </div>
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </div>
              )}
            />

            <form.Field
              name="showHistoricalUptime"
              children={(field) => (
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Historical Uptime</Label>
                    <p className="text-sm text-muted-foreground">
                      Display uptime percentages on the status page
                    </p>
                  </div>
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={
            createMutation.isPending ||
            (slugCheck && !slugCheck.available)
          }
        >
          {createMutation.isPending ? "Creating..." : "Create Status Page"}
        </Button>
      </div>
    </form>
  );
}
