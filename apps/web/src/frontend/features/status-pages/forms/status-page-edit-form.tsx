import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useDeleteLogo } from "../api/use-delete-logo";
import { useUpdateStatusPage } from "../api/use-update-status-page";
import { useUploadLogo } from "../api/use-upload-logo";
import { updateStatusPageSchema, type StatusPageResponse } from "../schemas";

export default function StatusPageEditForm({
  page,
}: {
  page: StatusPageResponse;
}) {
  const { teamId } = useParams({
    from: "/(dashboard)/$teamId/status-pages/$pageId/edit",
  });
  const updateMutation = useUpdateStatusPage();
  const uploadLogoMutation = useUploadLogo();
  const deleteLogoMutation = useDeleteLogo();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeCurrentLogo, setRemoveCurrentLogo] = useState(false);

  const form = useForm({
    defaultValues: {
      name: page.name,
      description: page.description || "",
      isPublic: page.isPublic,
      showHistoricalUptime: page.showHistoricalUptime,
    },
    validators: {
      onSubmit: updateStatusPageSchema,
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        teamId: Number(teamId),
        pageId: page.id,
        data: {
          name: value.name,
          description: value.description || null,
          isPublic: value.isPublic,
          showHistoricalUptime: value.showHistoricalUptime,
        },
      });

      if (removeCurrentLogo && page.logoKey) {
        await deleteLogoMutation.mutateAsync({
          teamId: Number(teamId),
          pageId: page.id,
        });
      }

      if (logoFile) {
        await uploadLogoMutation.mutateAsync({
          teamId: Number(teamId),
          pageId: page.id,
          file: logoFile,
        });
      }
    },
  });

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
      setRemoveCurrentLogo(false);
    }
  };

  const currentLogoUrl =
    page.logoKey && !removeCurrentLogo
      ? `/api/public/status/logo/${page.logoKey}`
      : null;

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
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
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                autoComplete="off"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />

      <Field>
        <Label>Slug</Label>
        <Input value={page.slug} disabled className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          /status/{page.slug} - Slug cannot be changed after creation
        </p>
      </Field>

      <form.Field
        name="description"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <Label htmlFor={field.name}>Description</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />

      <div className="space-y-4">
        <Label>Logo</Label>
        {logoPreview ? (
          <div className="flex items-center gap-4">
            <img src={logoPreview} alt="New logo preview" className="h-12" />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setLogoFile(null)}
            >
              Remove
            </Button>
          </div>
        ) : currentLogoUrl ? (
          <div className="flex items-center gap-4">
            <img src={currentLogoUrl} alt="Current logo" className="h-12" />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setRemoveCurrentLogo(true)}
            >
              Remove
            </Button>
          </div>
        ) : null}
        <Input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={handleLogoChange}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">PNG, JPG, or SVG. Max 2MB.</p>
      </div>

      <form.Field
        name="isPublic"
        children={(field) => (
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div>
              <Label>Public Status Page</Label>
              <p className="text-xs text-muted-foreground">
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
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div>
              <Label>Show Historical Uptime</Label>
              <p className="text-xs text-muted-foreground">
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

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          render={
            <Link
              to="/$teamId/status-pages/$pageId"
              params={{ teamId, pageId: String(page.id) }}
            />
          }
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={
            updateMutation.isPending ||
            uploadLogoMutation.isPending ||
            deleteLogoMutation.isPending
          }
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
